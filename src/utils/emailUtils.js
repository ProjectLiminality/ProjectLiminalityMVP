const { exec } = require('child_process');
const fs = require('fs').promises;

async function createEmailDraft(recipients, subject, body, attachmentPath) {
  console.log(`Creating email draft for recipients: ${recipients.join(', ')}`);
  console.log(`Subject: ${subject}`);
  console.log(`Attachment path: ${attachmentPath}`);

  const recipientString = recipients.join(',');
  const escapedSubject = subject.replace(/[\\"]/g, '\\$&');
  const escapedBody = body.replace(/[\\"]/g, '\\$&').replace(/\n/g, '\\n');
  
  let applescript = `
    tell application "Mail"
      set newMessage to make new outgoing message
      tell newMessage
        set visible to true
        set subject to "${escapedSubject}"
        set content to "${escapedBody}"
        repeat with recipientEmail in {"${recipientString}"}
          make new to recipient at end of to recipients with properties {address:recipientEmail}
        end repeat
  `;

  if (attachmentPath) {
    const escapedAttachmentPath = attachmentPath.replace(/[\\"]/g, '\\$&');
    applescript += `
        make new attachment with properties {file name:"${escapedAttachmentPath}"} at after the last paragraph
    `;
  }

  applescript += `
      end tell
    end tell
  `;

  return new Promise((resolve, reject) => {
    exec(`osascript -e '${applescript.replace(/'/g, "'\"'\"'")}'`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error creating email draft: ${error}`);
        console.error(`Stderr: ${stderr}`);
        reject(error);
      } else {
        console.log('Email draft created successfully');
        console.log(`Stdout: ${stdout}`);
        resolve();
      }
    });
  });
}

module.exports = {
  createEmailDraft
};
