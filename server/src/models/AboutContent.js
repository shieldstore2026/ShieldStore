import mongoose from 'mongoose';

const guildMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    avatar: { type: String, trim: true },
    bio: { type: String, trim: true },
  },
  { _id: true }
);

const aboutContentSchema = new mongoose.Schema(
  {
    title: { type: String, default: 'About Shield Store', trim: true },
    subtitle: { type: String, default: 'Trusted top-up partner for the Free Fire community.', trim: true },
    story: {
      type: String,
      default:
        'Shield Store helps players top up diamonds and memberships with a smooth, secure, and reliable experience.',
      trim: true,
    },
    mission: {
      type: String,
      default: 'Deliver fast service, clear pricing, and dependable support for every order.',
      trim: true,
    },
    guildName: { type: String, default: 'Shield Guild', trim: true },
    guildMembers: [guildMemberSchema],
  },
  { timestamps: true }
);

export default mongoose.model('AboutContent', aboutContentSchema);
