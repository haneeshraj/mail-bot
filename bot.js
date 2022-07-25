const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.MessageContent,
  ],
});

const prefix = ">";
let announceChannel = "";
let announceRole = "";
// .split(/\s+/);

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.content.startsWith(prefix)) {
    const [command, ...args] = message.content
      .slice(prefix.length)
      .split(/\s+/);

    if (command === "announce") {
      if (
        message.member.permissions.has(PermissionFlagsBits.ManageChannels) ||
        message.member.permissions.has(PermissionFlagsBits.Administrator)
      ) {
        if (args[0] === "channel") {
          announceChannel = args[1].slice(2, args[1].length - 1);

          const setEmbed = new EmbedBuilder()
            .setColor("Green")
            .setThumbnail(message.guild.iconURL())
            .setTitle("Success!")
            .setDescription(
              `Announcement channel has been set to <#${announceChannel}>`
            );
          return await message.channel.send({ embeds: [setEmbed] });
        }
        if (args[0] === "role") {
          announceRole = args[1].slice(3, args[1].length - 1);
          const setEmbed = new EmbedBuilder()
            .setColor("Green")
            .setThumbnail(message.guild.iconURL())
            .setTitle("Success!")
            .setDescription(
              `Announcement role has been set to <@&${announceRole}>`
            );
          return await message.channel.send({ embeds: [setEmbed] });
        }
        if (args[0] === "broadcast") {
          if (!announceChannel || !announceRole) {
            const errorEmbed = new EmbedBuilder()
              .setColor("Red")
              .setThumbnail(message.guild.iconURL())
              .setTitle("Error!")
              .setDescription(
                !announceChannel && !announceRole
                  ? "Please assign the announce role and channel by using the \n`>announce channel #channel-name` and \n`>announce role @role`"
                  : !announceRole
                  ? "Please assign the announce role by using \n`>announce channel @role`\n**Note** : Make sure thee role is mentionable"
                  : !announceChannel
                  ? "Please assign the announce channel by using \n`>announce channel #channel-name`"
                  : ""
              );
            return await message.channel.send({ embeds: [errorEmbed] });
          }
          const [_, ...announcementContent] = args;
          if (
            !announcementContent.join(" ").includes("title:") ||
            !announcementContent.join(" ").includes("desc:")
          ) {
            const syntaxErrorEmbed = new EmbedBuilder()
              .setColor("Red")
              .setThumbnail(message.guild.iconURL())
              .setTitle("Error!")
              .setDescription("You havent given the right syntax!")
              .setFields({
                name: "Right way to use the coomand",
                value:
                  "```>announce broadcast title: Title Here desc: Description here ```",
              });
            return message.channel.send({ embeds: [syntaxErrorEmbed] });
          }
          const [BCtitle, BCDesc] = announcementContent
            .join(" ")
            .split("title:")[1]
            .split("desc:");

          const membersRole = message.guild.roles.cache
            .get(announceRole)
            .members.map((m) => m.user.id);

          const announceEmbed = new EmbedBuilder()
            .setAuthor({
              name: message.guild.name,
            })
            .setThumbnail(message.guild.iconURL())
            .setTitle(BCtitle)
            .setDescription(BCDesc);

          membersRole.forEach(async (subscribedUser) => {
            try {
              return await message.guild.members.cache
                .get(subscribedUser)
                .send({ embeds: [announceEmbed] });
            } catch (err) {
              console.log(
                "could not the announcements to " +
                  client.users.cache.get(subscribedUser).tag
              );
            }
          });
          const sendAnnouncement =
            message.client.channels.cache.get(announceChannel);
          sendAnnouncement.send({ embeds: [announceEmbed] });
        }
      } else {
        console.log("man wants to be a haccer");
      }
    }
  }
});

client.on("ready", (client) => {
  console.log(`${client.user.tag} is now online and running!`);
});

client.login(process.env.MAIL_DISCORD_TOKEN);
