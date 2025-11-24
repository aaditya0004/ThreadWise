const Imap = require('node-imap');
const {simpleParser} = require('mailparser');

// This function will do the heavy lifting of fetching emails
const fetchEmails = (accountConfig) => {
    return new Promise((resolve, reject) => {
        const emails = [];              // to store the fetched emails

        // 1. Configure the IMAP connection 
        const imap = new Imap({
            user: accountConfig.user,
            password: accountConfig.password,               // this must be the decrypted password
            host: accountConfig.host,
            port: accountConfig.port,
            tls: accountConfig.tls,
            tlsOptions: {rejectUnauthorized: false},            // Helpful for some development environments
        });

        // 2. Define what happens when the connection is ready
        imap.once('ready', () => {
            // Open the 'INBOX' in the read only mode 
            imap.openBox('INBOX', true, (err, box) => {
                if(err) return reject(err);

                // Search for the last 20 emails
                // '1:*' means all emails, but we will slice the search 
                // for simplicity in this step, lets just fetch the last 10 emails

                const total = box.messages.total;

                if (total === 0) {
                    imap.end();
                    return resolve([]);
                }
                
                const start = total > 10 ? total - 9 : 1;
                const fetchRange = `${start}:*`;

                const f = imap.seq.fetch(fetchRange, {
                    bodies: '',  // Fetch the entire email body
                    struct: true,
                });

                f.on('message', (msg, seqno) => {
                    msg.on('body', (stream, info) => {
                        // parse the raw email stream into a nice object
                        simpleParser(stream, async(err, parsed) => {
                            if(err) console.error('Parsing error:', err);

                            // add the clean email to our array;
                            emails.push({
                                messageId: parsed.messageId,
                                subject: parsed.subject,
                                from: parsed.from.text,
                                date: parsed.date,
                                body: parsed.text,
                                snippet: parsed.text ? parsed.text.substring(0, 100) : '',      // first 100 chars
                            });
                        });
                    });
                });

                f.once('error', (err) => {
                    reject(err);
                });

                f.once('end', () => {
                    // when fetch is done, end the connection 
                    imap.end();
                });
            });
        });

        // 3. Define what happens when the connection ends or errors
        imap.once('error', (err) => {
            reject(err);
        });

        imap.once('end', () => {
            // wait a tiny bit to ensure parsing finished 
            setTimeout(() => {
                resolve(emails);
            }, 1000);
        });

        // 4. Actually Connect!
        imap.connect();
    });
};

module.exports = {fetchEmails};