/**
 * =========================================================================
 * MATHS MASTER STUDIO — ADVANCED GOOGLE APPS SCRIPT WEBHOOK
 * Tracks:
 * 1. "Dashboard": Real-time counters (Unique Students, Total Sessions, Last Activity)
 * 2. "Joined_Students": Unique Student Directory (First Joined, Last Login, Total Logins, Latest Activity)
 * 3. "Session_Logs": Complete historical audit log of every login, browser refresh, test start, and test submission!
 * =========================================================================
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open your target Google Sheet (Maths-Master-Studio).
 * 2. Click "Extensions" > "Apps Script".
 * 3. Delete any previous code in the editor and PASTE THIS ENTIRE FILE.
 * 4. Click "Deploy" > "Manage deployments".
 * 5. Click the pencil icon to edit the active deployment, change Version to "New version", and click "Deploy"!
 *    (Or click "Deploy" > "New deployment" > Web app > Access: Anyone > Deploy).
 * =========================================================================
 */

var WEBHOOK_SECRET = "mms_2026";

function doPost(e) {
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

    // 1. Verify Secret
    if (WEBHOOK_SECRET && data.secret !== WEBHOOK_SECRET) {
      return responseJSON({ status: "error", message: "Unauthorized: Invalid webhook secret token" }, 401);
    }

    var name = (data.name || "").trim();
    var email = (data.email || "").trim().toLowerCase();
    var authMethod = (data.authMethod || "Google").trim();
    var activity = (data.activity || data.eventType || "Page Refresh / Visit").trim();
    var device = (data.device || "Desktop / Browser").trim();
    var timestamp = data.timestamp || getFormattedISTDate();

    if (!email) {
      return responseJSON({ status: "error", message: "Email is required" }, 400);
    }
    if (!name) {
      name = email.split("@")[0];
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 2. Ensure "Joined_Students" tab exists
    var studentsSheet = ss.getSheetByName("Joined_Students");
    if (!studentsSheet) {
      studentsSheet = ss.insertSheet("Joined_Students");
      var headers = [
        "First Joined (IST)",
        "Student Name",
        "Email Address",
        "Auth Method",
        "Last Login (IST)",
        "Login Count",
        "Latest Activity"
      ];
      studentsSheet.appendRow(headers);
      var headerRange = studentsSheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#312e81");
      headerRange.setFontColor("#ffffff");
      headerRange.setFontWeight("bold");
      headerRange.setFontFamily("Inter");
      headerRange.setHorizontalAlignment("center");
      studentsSheet.setFrozenRows(1);
    }

    // 3. Check if student already exists by Email (Column C)
    var lastRow = studentsSheet.getLastRow();
    var foundRow = -1;
    var currentLogins = 0;

    if (lastRow > 1) {
      var emailValues = studentsSheet.getRange(2, 3, lastRow - 1, 1).getValues();
      for (var i = 0; i < emailValues.length; i++) {
        if (String(emailValues[i][0]).toLowerCase().trim() === email) {
          foundRow = i + 2; // 1-indexed, starting after header
          break;
        }
      }
    }

    var isNew = (foundRow === -1);

    if (isNew) {
      currentLogins = 1;
      studentsSheet.appendRow([
        timestamp,       // Col A: First Joined
        name,            // Col B: Name
        email,           // Col C: Email
        authMethod,      // Col D: Auth Method
        timestamp,       // Col E: Last Login
        1,               // Col F: Login Count
        activity         // Col G: Latest Activity
      ]);
      var newRowIdx = studentsSheet.getLastRow();
      studentsSheet.getRange(newRowIdx, 1, 1, 7).setFontFamily("Inter");
    } else {
      var existingLogins = parseInt(studentsSheet.getRange(foundRow, 6).getValue(), 10) || 1;
      currentLogins = existingLogins + 1;
      studentsSheet.getRange(foundRow, 5).setValue(timestamp); // Col E: Last Login
      studentsSheet.getRange(foundRow, 6).setValue(currentLogins); // Col F: Count
      studentsSheet.getRange(foundRow, 7).setValue(activity); // Col G: Latest Activity

      // Update name if previously blank or generic
      var existingName = studentsSheet.getRange(foundRow, 2).getValue();
      if (!existingName || existingName === email.split("@")[0]) {
        studentsSheet.getRange(foundRow, 2).setValue(name);
      }
    }

    // 4. Ensure "Session_Logs" Tab Exists & Record This Event Chronologically
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
        "User Visit #"
      ];
      logsSheet.appendRow(logHeaders);
      var logHeaderRange = logsSheet.getRange(1, 1, 1, logHeaders.length);
      logHeaderRange.setBackground("#1e1b4b");
      logHeaderRange.setFontColor("#ffffff");
      logHeaderRange.setFontWeight("bold");
      logHeaderRange.setFontFamily("Inter");
      logHeaderRange.setHorizontalAlignment("center");
      logsSheet.setFrozenRows(1);
    }

    logsSheet.appendRow([
      timestamp,
      name,
      email,
      activity,
      authMethod,
      device,
      currentLogins
    ]);
    var newLogIdx = logsSheet.getLastRow();
    logsSheet.getRange(newLogIdx, 1, 1, 7).setFontFamily("Inter");

    // 5. Update "Dashboard" tab metrics
    updateDashboard(ss, timestamp);

    return responseJSON({
      status: "success",
      message: "Activity logged in Joined_Students & Session_Logs",
      student: {
        name: name,
        email: email,
        authMethod: authMethod,
        activity: activity,
        isNew: isNew,
        logins: currentLogins,
        timestamp: timestamp
      }
    }, 200);

  } catch (err) {
    return responseJSON({ status: "error", message: err.toString() }, 500);
  }
}

function updateDashboard(ss, lastActivity) {
  var dashSheet = ss.getSheetByName("Dashboard");
  if (!dashSheet) {
    dashSheet = ss.insertSheet("Dashboard", 0);
  }

  var studentsSheet = ss.getSheetByName("Joined_Students");
  var logsSheet = ss.getSheetByName("Session_Logs");

  var totalStudents = 0;
  var googleCount = 0;
  var emailCount = 0;
  var totalSessions = logsSheet ? Math.max(0, logsSheet.getLastRow() - 1) : 0;

  if (studentsSheet && studentsSheet.getLastRow() > 1) {
    var data = studentsSheet.getRange(2, 4, studentsSheet.getLastRow() - 1, 1).getValues();
    totalStudents = data.length;
    for (var i = 0; i < data.length; i++) {
      var method = String(data[i][0]).toLowerCase();
      if (method.indexOf("google") !== -1) {
        googleCount++;
      } else {
        emailCount++;
      }
    }
  }

  dashSheet.clear();

  // Title
  dashSheet.getRange("A1:D1").merge();
  dashSheet.getRange("A1").setValue("MATHS MASTER STUDIO — LIVE ADMISSIONS & USER METRICS");
  dashSheet.getRange("A1").setBackground("#1e1b4b").setFontColor("#ffffff").setFontWeight("bold").setFontSize(14).setHorizontalAlignment("center");

  // Summary Metrics Table
  var metrics = [
    ["Metric", "Value", "Notes"],
    ["Total Registered Students", totalStudents, "Unique students registered"],
    ["Total Sessions & Refreshes Recorded", totalSessions, "Total live logins, visits and exam actions in Session_Logs"],
    ["Google Sign-In Accounts", googleCount, "Verified via Google OAuth"],
    ["Email/Password Accounts", emailCount, "Verified via Supabase Email Auth"],
    ["Last Active Sync (IST)", lastActivity || getFormattedISTDate(), "Real-time webhook sync from Maths Master Studio"]
  ];

  var range = dashSheet.getRange(3, 1, metrics.length, 3);
  range.setValues(metrics);
  range.setFontFamily("Inter");

  // Header formatting
  var metricHdr = dashSheet.getRange("A3:C3");
  metricHdr.setBackground("#4338ca").setFontColor("#ffffff").setFontWeight("bold");

  dashSheet.getRange("B4:B7").setFontWeight("bold").setFontSize(12).setHorizontalAlignment("center").setFontColor("#312e81");

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
    service: "Maths Master Studio Google Sheets Webhook",
    time: getFormattedISTDate()
  }, 200);
}
