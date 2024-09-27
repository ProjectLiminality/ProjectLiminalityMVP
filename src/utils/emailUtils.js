const { exec } = require('child_process');

function createEmailDraft(recipients, subject, body) {
  const recipientString = recipients.join(',');
  const escapedSubject = subject.replace(/'/g, "'\"'\"'");
  const escapedBody = body.replace(/'/g, "'\"'\"'").replace(/\n/g, '\\n');
  
  const applescript = `
    tell application "Mail"
      set newMessage to make new outgoing message
      tell newMessage
        set visible to true
        set subject to "${escapedSubject}"
        set content to "${escapedBody}"
        repeat with recipientEmail in {"${recipientString}"}
          make new to recipient at end of to recipients with properties {address:recipientEmail}
        end repeat
      end tell
    end tell
  `;

  return new Promise((resolve, reject) => {
    exec(`osascript -e '${applescript}'`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error creating email draft: ${error}`);
        reject(error);
      } else {
        console.log('Email draft created successfully');
        resolve();
      }
    });
  });
}

module.exports = {
  createEmailDraft
};
