/**
 * =========================================================================
 * MATHS MASTER STUDIO — LIVE STUDENT LEARNING TELEMETRY & WEBHOOK
 * =========================================================================
 * 
 * Master Columns in 'Joined_Students':
 * Col A: Joined At (IST)
 * Col B: Student Name
 * Col C: Email Address
 * Col D: Auth Method
 * Col E: Test Studio Access
 * Col F: Payment ID
 * Col G: Last Login (IST)
 * Col H: Live Status (Dynamic formula auto-evaluating (NOW()-K)*1440 > 2.5)
 * Col I: Presence State (Learning, Idle, Offline)
 * Col J: Current Activity (Section / Chapter / Exam)
 * Col K: Last Active (Timestamp object for NOW() comparison)
 * Col L: Total Study Mins (Cumulative minutes counter)
 * 
 * Also Features:
 * - Session_Logs tab for permanent historical audit trail of logins & exams
 * - Dashboard tab for live admissions & active student counters
 * - Concurrency protection with LockService (10s timeout)
 * =========================================================================
 */

var WEBHOOK_SECRET = "mms_2026";

var HEADERS = [
  "Joined At (IST)",
  "Student Name",
  "Email Address",
  "Auth Method",
  "Test Studio Access",
  "Payment ID",
  "Last Login (IST)",
  "Live Status",
  "Presence State",
  "Current Activity",
  "Last Active",
  "Total Study Mins"
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  var hasLock = lock.tryLock(10000);
  if (!hasLock) {
    return responseJSON({ status: "error", message: "Server busy. Try again." }, 429);
  }

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return responseJSON({ status: "error", message: "No payload received" }, 400);
    }

    var data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return responseJSON({ status: "error", message: "Invalid JSON format: " + parseErr.message }, 400);
    }

    // 1. Secret Verification
    if (WEBHOOK_SECRET && data.secret !== WEBHOOK_SECRET) {
      return responseJSON({ status: "error", message: "Unauthorized: Invalid webhook secret token" }, 401);
    }

    var email = (data.email || "").trim().toLowerCase();
    if (!email) {
      return responseJSON({ status: "error", message: "Email is required" }, 400);
    }

    var eventType = (data.event || data.eventType || "heartbeat").toLowerCase();
    var name = (data.name || "").trim() || email.split("@")[0];
    var authMethod = (data.authMethod || "Google").trim();
    var activity = (data.activity || "Home · Syllabus Roadmap").trim();
    var device = (data.device || "Desktop · Web").trim();
    var activeMinutesDelta = Number(data.activeMinutesDelta) || 0;
    var timestamp = data.timestamp || getFormattedISTDate();

    // Determine presence state
    var presenceState = "Learning";
    if (eventType === "offline") {
      presenceState = "Offline";
    } else if (data.status) {
      presenceState = (data.status === "Idle") ? "Idle" : ((data.status === "Offline") ? "Offline" : "Learning");
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 2. Setup / Upgrade Joined_Students sheet
    var studentsSheet = ss.getSheetByName("Joined_Students");
    if (!studentsSheet) {
      studentsSheet = ss.insertSheet("Joined_Students");
    }

    ensureHeaders(studentsSheet);

    // 3. Find student row by Email (Col C)
    var lastRow = studentsSheet.getLastRow();
    var foundRow = -1;

    if (lastRow > 1) {
      var emailValues = studentsSheet.getRange(2, 3, lastRow - 1, 1).getValues();
      for (var i = 0; i < emailValues.length; i++) {
        if (String(emailValues[i][0]).toLowerCase().trim() === email) {
          foundRow = i + 2;
          break;
        }
      }
    }

    var isNew = (foundRow === -1);
    var nowObj = new Date();

    if (isNew) {
      var newRow = lastRow + 1;
      var liveFormula = '=IF(K' + newRow + '="","",IF((NOW()-K' + newRow + ')*1440>2.5,"⚪ Offline",IF(I' + newRow + '="Offline","⚪ Offline",IF(I' + newRow + '="Idle","🟡 Idle","🟢 Learning"))))';
      var initialMins = (presenceState === "Learning") ? activeMinutesDelta : 0;

      studentsSheet.appendRow([
        timestamp,                  // Col A: Joined At (IST)
        name,                       // Col B: Student Name
        email,                      // Col C: Email Address
        authMethod,                 // Col D: Auth Method
        "Granted",                  // Col E: Test Studio Access
        "",                         // Col F: Payment ID
        timestamp,                  // Col G: Last Login (IST)
        liveFormula,                // Col H: Live Status Formula
        presenceState,              // Col I: Presence State
        activity,                   // Col J: Current Activity
        nowObj,                     // Col K: Last Active (Date object)
        initialMins                 // Col L: Total Study Mins
      ]);

      studentsSheet.getRange(newRow, 1, 1, HEADERS.length).setFontFamily("Inter");
      studentsSheet.getRange(newRow, 11).setNumberFormat("dd/MM/yyyy HH:mm:ss");
      studentsSheet.getRange(newRow, 12).setNumberFormat("#,##0");
      foundRow = newRow;
    } else {
      var r = foundRow;
      // Update Name if better name provided
      if (name && name !== email.split("@")[0]) {
        studentsSheet.getRange(r, 2).setValue(name);
      }
      if (authMethod) {
        studentsSheet.getRange(r, 4).setValue(authMethod);
      }

      // If login event, update Last Login
      if (eventType === "login" || eventType === "student logged in") {
        studentsSheet.getRange(r, 7).setValue(timestamp);
      }

      // Live Status formula check / ensure
      var expectedFormula = '=IF(K' + r + '="","",IF((NOW()-K' + r + ')*1440>2.5,"⚪ Offline",IF(I' + r + '="Offline","⚪ Offline",IF(I' + r + '="Idle","🟡 Idle","🟢 Learning"))))';
      studentsSheet.getRange(r, 8).setFormula(expectedFormula);

      // Presence State & Activity
      studentsSheet.getRange(r, 9).setValue(presenceState);
      if (eventType !== "offline") {
        studentsSheet.getRange(r, 10).setValue(activity);
      }

      // Last Active Date object
      studentsSheet.getRange(r, 11).setValue(nowObj);
      studentsSheet.getRange(r, 11).setNumberFormat("dd/MM/yyyy HH:mm:ss");

      // Total Study Mins increment
      if (activeMinutesDelta > 0 && presenceState === "Learning") {
        var curMins = Number(studentsSheet.getRange(r, 12).getValue()) || 0;
        studentsSheet.getRange(r, 12).setValue(curMins + activeMinutesDelta);
        studentsSheet.getRange(r, 12).setNumberFormat("#,##0");
      }
    }

    // 4. Session_Logs Audit Trail for Significant Events
    var shouldLogSession = (
      eventType === "login" || 
      eventType === "offline" || 
      eventType.indexOf("exam") !== -1 ||
      activity.indexOf("Exam") !== -1 ||
      isNew
    );

    if (shouldLogSession) {
      logSessionEvent(ss, timestamp, name, email, activity, authMethod, device, presenceState);
    }

    // 5. Update Dashboard
    updateDashboard(ss, timestamp);

    return responseJSON({
      status: "success",
      message: "Telemetry processed successfully",
      student: {
        name: name,
        email: email,
        presenceState: presenceState,
        activity: activity,
        lastActive: timestamp
      }
    }, 200);

  } catch (err) {
    return responseJSON({ status: "error", message: err.toString() }, 500);
  } finally {
    lock.releaseLock();
  }
}

function ensureHeaders(sheet) {
  var lastCol = sheet.getLastColumn();
  var lastRow = sheet.getLastRow();

  // Handle migration from previous 6-column schema
  if (lastCol <= 6 || (lastRow > 0 && String(sheet.getRange(1, 5).getValue()).indexOf("Last Login") !== -1)) {
    if (lastRow > 1) {
      for (var r = 2; r <= lastRow; r++) {
        var oldLastLogin = sheet.getRange(r, 5).getValue();
        sheet.getRange(r, 5).setValue("Granted"); // Col E: Test Studio Access
        sheet.getRange(r, 6).setValue("");        // Col F: Payment ID
        sheet.getRange(r, 7).setValue(oldLastLogin || getFormattedISTDate()); // Col G: Last Login (IST)
        var form = '=IF(K' + r + '="","",IF((NOW()-K' + r + ')*1440>2.5,"⚪ Offline",IF(I' + r + '="Offline","⚪ Offline",IF(I' + r + '="Idle","🟡 Idle","🟢 Learning"))))';
        sheet.getRange(r, 8).setFormula(form);
        sheet.getRange(r, 9).setValue("Offline");
        sheet.getRange(r, 10).setValue("—");
        sheet.getRange(r, 11).setValue(new Date());
        sheet.getRange(r, 11).setNumberFormat("dd/MM/yyyy HH:mm:ss");
        sheet.getRange(r, 12).setValue(0);
        sheet.getRange(r, 12).setNumberFormat("#,##0");
      }
    }
  }

  // Ensure row 1 has current HEADERS
  var range = sheet.getRange(1, 1, 1, HEADERS.length);
  range.setValues([HEADERS]);
  range.setBackground("#312e81");
  range.setFontColor("#ffffff");
  range.setFontWeight("bold");
  range.setFontFamily("Inter");
  range.setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
}

function logSessionEvent(ss, timestamp, name, email, activity, authMethod, device, presence) {
  var logsSheet = ss.getSheetByName("Session_Logs");
  if (!logsSheet) {
    logsSheet = ss.insertSheet("Session_Logs");
    var logHeaders = [
      "Timestamp (IST)",
      "Student Name",
      "Email Address",
      "Activity / Event",
      "Auth Method",
      "Device / Browser",
      "Status"
    ];
    logsSheet.appendRow(logHeaders);
    var hr = logsSheet.getRange(1, 1, 1, logHeaders.length);
    hr.setBackground("#1e1b4b").setFontColor("#ffffff").setFontWeight("bold").setFontFamily("Inter").setHorizontalAlignment("center");
    logsSheet.setFrozenRows(1);
  }

  logsSheet.appendRow([
    timestamp,
    name,
    email,
    activity,
    authMethod,
    device,
    presence
  ]);
  var r = logsSheet.getLastRow();
  logsSheet.getRange(r, 1, 1, 7).setFontFamily("Inter");
}

function updateDashboard(ss, lastActivity) {
  var dashSheet = ss.getSheetByName("Dashboard");
  if (!dashSheet) {
    dashSheet = ss.insertSheet("Dashboard", 0);
  }

  var studentsSheet = ss.getSheetByName("Joined_Students");
  var totalStudents = 0;
  var googleCount = 0;
  var emailCount = 0;
  var activeLearningCount = 0;
  var totalStudyMins = 0;

  if (studentsSheet && studentsSheet.getLastRow() > 1) {
    var numRows = studentsSheet.getLastRow() - 1;
    var authCol = studentsSheet.getRange(2, 4, numRows, 1).getValues();
    var presenceCol = studentsSheet.getRange(2, 9, numRows, 1).getValues();
    var studyMinsCol = studentsSheet.getRange(2, 12, numRows, 1).getValues();

    totalStudents = numRows;
    for (var i = 0; i < numRows; i++) {
      var method = String(authCol[i][0]).toLowerCase();
      if (method.indexOf("google") !== -1) googleCount++;
      else emailCount++;

      var presence = String(presenceCol[i][0]);
      if (presence === "Learning") activeLearningCount++;

      totalStudyMins += Number(studyMinsCol[i][0]) || 0;
    }
  }

  dashSheet.clear();

  dashSheet.getRange("A1:D1").merge();
  dashSheet.getRange("A1").setValue("MATHS MASTER STUDIO — LIVE ADMISSIONS & LEARNING METRICS");
  dashSheet.getRange("A1").setBackground("#1e1b4b").setFontColor("#ffffff").setFontWeight("bold").setFontSize(14).setHorizontalAlignment("center");

  var metrics = [
    ["Metric", "Value", "Notes"],
    ["Total Registered Students", totalStudents, "Unique registered student accounts"],
    ["Currently Active Learners", activeLearningCount, "Students actively in 'Learning' state"],
    ["Total Study Time", (totalStudyMins / 60).toFixed(1) + " Hours", totalStudyMins + " minutes of active learning"],
    ["Google Sign-In Accounts", googleCount, "Verified via Google OAuth"],
    ["Email/Password Accounts", emailCount, "Verified via Supabase Email Auth"],
    ["Last Active Sync (IST)", lastActivity || getFormattedISTDate(), "Real-time webhook telemetry from Maths Master Studio"]
  ];

  var range = dashSheet.getRange(3, 1, metrics.length, 3);
  range.setValues(metrics);
  range.setFontFamily("Inter");

  var metricHdr = dashSheet.getRange("A3:C3");
  metricHdr.setBackground("#4338ca").setFontColor("#ffffff").setFontWeight("bold");

  dashSheet.getRange("B4:B8").setFontWeight("bold").setFontSize(12).setHorizontalAlignment("center").setFontColor("#312e81");
  dashSheet.autoResizeColumns(1, 4);
}

function getFormattedISTDate() {
  var now = new Date();
  return Utilities.formatDate(now, "Asia/Kolkata", "dd/MM/yyyy hh:mm:ss a 'IST'");
}

function responseJSON(obj, statusCode) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return responseJSON({
    status: "ok",
    service: "Maths Master Studio Google Sheets Telemetry Webhook",
    time: getFormattedISTDate()
  }, 200);
}
