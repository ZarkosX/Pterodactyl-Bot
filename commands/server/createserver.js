const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const PteroAPI = require('../../utils/ptero');
const Database = require('../../utils/database');
const crypto = require('crypto');

function generatePassword() {
  return crypto.randomBytes(10).toString('hex') + "A1!";
}

function generateEmail(tag, id) {
  const cleanTag = tag.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return `${cleanTag}${id.slice(-4)}@welderhost.bot`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('createbot')
    .setDescription('احجز بوت Node.js خاص بك (سيرفر واحد لكل شخص)'),

  async execute(interaction) {
    const userId = interaction.user.id;
    const tag = interaction.user.tag.split('#')[0];

    await interaction.deferReply({ ephemeral: true });

    // منع التكرار
    if (Database.findUserByDiscordId(userId)) {
      return interaction.editReply({
        content: "لقد قمت بحجز سيرفر من قبل! كل شخص له سيرفر واحد فقط.",
        ephemeral: true
      });
    }

    const email = generateEmail(tag, userId);
    const password = generatePassword();

    try {
      // إنشاء يوزر في الـ Panel
      const pteroUser = await PteroAPI.createUser(email, tag + userId.slice(-4), tag, "Bot");

      // إنشاء السيرفر
      const server = await PteroAPI.createServer({
        name: `${tag}'s Bot`,
        user: pteroUser.id,
        egg: 17,
        docker_image: "ghcr.io/pelican-eggs/yolks:nodejs_23",
        startup: `if [[ -d .git ]] && [[ 0 == "1" ]]; then git pull; fi; if [[ ! -z \${NODE_PACKAGES} ]]; then /usr/local/bin/npm install \${NODE_PACKAGES}; fi; if [[ ! -z \${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall \${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; if [[ "\${MAIN_FILE}" == "*.js" ]]; then /usr/local/bin/node "/home/container/\${MAIN_FILE}" \${NODE_ARGS}; else /usr/local/bin/ts-node --esm "/home/container/\${MAIN_FILE}" \${NODE_ARGS}; fi`,
        environment: {},
        limits: { memory: 512, swap: 0, disk: 1024, cpu: 50, io: 500 },
        feature_limits: { databases: 0, allocations: 1, backups: 1 },
        allocation: { default: parseInt(process.env.DEFAULT_LOCATION_ID || 1) }
      });

      // حفظ البيانات محليًا
      Database.addUser({
        discordId: userId,
        discordTag: interaction.user.tag,
        email,
        password,
        pteroUserId: pteroUser.id,
        serverId: server.id,
        createdAt: new Date().toISOString()
      });

      // إرسال رسالة للعميل في الـ DM
      const dmEmbed = new EmbedBuilder()
        .setTitle("تم إنشاء بوتك بنجاح! Welcome to WelderHosting")
        .setColor(0x00ff00)
        .setDescription("حافظ على البيانات دي كويس جدًا")
        .addFields(
          { name: "Panel URL", value: "https://panel.welderhosting.qzz.io", inline: false },
          { name: "الإيميل", value: `\`${email}\``, inline: false },
          { name: "كلمة السر", value: `||${password}||`, inline: false },
          { name: "اسم السيرفر", value: server.name, inline: false },
          { name: "المواصفات", value: "512MB RAM • 50% CPU • 1GB Disk • 1 Backup", inline: false }
        )
        .setFooter({ text: "WelderHosting © 2025 - كل شخص له سيرفر واحد فقط" })
        .setTimestamp();

      await interaction.user.send({ embeds: [dmEmbed] });

      await interaction.editReply({
        content: "تم إنشاء البوت بنجاح! راجع الرسائل الخاصة (DM) عشان البيانات.",
        ephemeral: true
      });

    } catch (err) {
      console.error(err);
      await interaction.editReply({
        content: "في مشكلة حصلت.. تواصل مع الإدارة.",
        ephemeral: true
      });
    }
  }
};
