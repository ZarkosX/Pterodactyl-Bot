require('dotenv').config();
const { REST, Routes } = require('discord.js');

const commands = [
  {
    name: 'createbot',
    description: 'احجز بوت Node.js خاص بك (سيرفر واحد لكل شخص)'
  }
];

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('بدأ رفع الأمر /createbot في سيرفرك...');

    await rest.put(
      Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, '1402751325837725776'),
      { body: commands }
    );

    console.log('تم رفع الأمر /createbot بنجاح في سيرفرك!');
    console.log('روح دلوقتي في أي قناة واكتب /createbot');
  } catch (error) {
    console.error('فشل:', error);
  }
})();
