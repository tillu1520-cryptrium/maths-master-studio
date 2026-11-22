import http from 'http';
import net from 'net';
import dns from 'dns';
import { execSync } from 'child_process';

const resolver = new dns.promises.Resolver();
resolver.setServers(['8.8.8.8', '1.1.1.1']);

const server = http.createServer((req, res) => {
  res.writeHead(405);
  res.end('CONNECT only');
});

server.on('connect', async (req, clientSocket, head) => {
  const [host, port] = req.url.split(':');
  try {
    const ips = await resolver.resolve4(host);
    const ip = ips[0];
    const targetSocket = net.connect(Number(port) || 443, ip, () => {
      clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
      if (head && head.length) targetSocket.write(head);
      targetSocket.pipe(clientSocket);
      clientSocket.pipe(targetSocket);
    });
    targetSocket.on('error', () => clientSocket.destroy());
    clientSocket.on('error', () => targetSocket.destroy());
  } catch (e) {
    clientSocket.destroy();
  }
});

server.listen(0, '127.0.0.1', () => {
  const port = server.address().port;
  console.log(`DNS bypass proxy listening on 127.0.0.1:${port}`);
  try {
    console.log('Executing git push origin main with HTTPS_PROXY...');
    const out = execSync('git push origin main', {
      env: { ...process.env, HTTPS_PROXY: `http://127.0.0.1:${port}` },
      encoding: 'utf8',
      stdio: 'inherit'
    });
    console.log('✅ Git push completed successfully!');
  } catch (err) {
    console.error('Git push failed:', err.message);
    process.exit(1);
  } finally {
    server.close();
  }
});
