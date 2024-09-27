const { exec } = require('child_process');

function createEmailDraft(recipients, subject, body) {
  const recipientString = recipients.join(',');
  const escapedBody = body.replace(/\n/g, '\\n').replace(/"/g, '\\"');
  const applescript = `tell application "Mail"
    set newMessage to make new outgoing message
    tell newMessage
      set visible to true
      set subject to "${subject}"
      set content to "${escapedBody}"
      repeat with recipientEmail in {"${recipientString}"}
        make new to recipient at end of to recipients with properties {address:recipientEmail}
      end repeat
    end tell
  end tell`;

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
