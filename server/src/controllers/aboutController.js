import AboutContent from '../models/AboutContent.js';

async function getOrCreateAbout() {
  let about = await AboutContent.findOne();
  if (!about) {
    about = await AboutContent.create({});
  }
  return about;
}

export const getAbout = async (req, res, next) => {
  try {
    const about = await getOrCreateAbout();
    res.json(about);
  } catch (err) {
    next(err);
  }
};

export const updateAbout = async (req, res, next) => {
  try {
    const about = await getOrCreateAbout();
    const { title, subtitle, story, mission, guildName } = req.body || {};
    if (title !== undefined) about.title = String(title).trim();
    if (subtitle !== undefined) about.subtitle = String(subtitle).trim();
    if (story !== undefined) about.story = String(story).trim();
    if (mission !== undefined) about.mission = String(mission).trim();
    if (guildName !== undefined) about.guildName = String(guildName).trim();
    await about.save();
    res.json(about);
  } catch (err) {
    next(err);
  }
};

export const addGuildMember = async (req, res, next) => {
  try {
    const about = await getOrCreateAbout();
    const { name, role, avatar, bio } = req.body || {};
    if (!name || !role) return res.status(400).json({ message: 'Member name and role are required' });
    about.guildMembers.push({
      name: String(name).trim(),
      role: String(role).trim(),
      avatar: avatar ? String(avatar).trim() : '',
      bio: bio ? String(bio).trim() : '',
    });
    await about.save();
    res.status(201).json(about);
  } catch (err) {
    next(err);
  }
};

export const updateGuildMember = async (req, res, next) => {
  try {
    const about = await getOrCreateAbout();
    const member = about.guildMembers.id(req.params.memberId);
    if (!member) return res.status(404).json({ message: 'Guild member not found' });
    const { name, role, avatar, bio } = req.body || {};
    if (name !== undefined) member.name = String(name).trim();
    if (role !== undefined) member.role = String(role).trim();
    if (avatar !== undefined) member.avatar = String(avatar).trim();
    if (bio !== undefined) member.bio = String(bio).trim();
    await about.save();
    res.json(about);
  } catch (err) {
    next(err);
  }
};

export const deleteGuildMember = async (req, res, next) => {
  try {
    const about = await getOrCreateAbout();
    const member = about.guildMembers.id(req.params.memberId);
    if (!member) return res.status(404).json({ message: 'Guild member not found' });
    member.deleteOne();
    await about.save();
    res.json(about);
  } catch (err) {
    next(err);
  }
};
