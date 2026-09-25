const fs = require('fs');
const path = require('path');

const patterns = [
  /ProfilePictureUploadScreen/g,
  /Registration Trend/gi,
  /GOVERNMENT_MOCK_DATA/g,
  /messaging/gi,
  /scratch_.*\.html/g,
  /scaffold\.ps1/gi,
  /Google Sign-In/gi,
  /password rules/gi,
  /role-selection/gi,
  /ResetPasswordScreen/g,
  /avatar prefill/gi,
  /BUG-4/gi,
  /staleness/gi,
  /wizard/gi,
  /step/gi,
  /migration/gi,
  /016/g,
  /017/g,
  /email confirmation/gi,
  /keep-alive/gi,
  /SMTP/g,
  /email provider/gi,
  /Resend/gi,
  /demo data/gi,
  /seed data/gi,
  /service_role/g
];

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && !file.startsWith('.git')) {
        scanDir(fullPath);
      }
    } else if (fullPath.endsWith('.md')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        for (const pattern of patterns) {
          if (lines[i].match(pattern)) {
             console.log(`${fullPath}:::${i+1}:::${lines[i].trim()}`);
             break; // only print the line once
          }
        }
      }
    }
  }
}

scanDir('.');
