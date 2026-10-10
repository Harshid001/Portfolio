const profiles = {
  github: 'Harshid001',
  leetcode: 'AXiXOEQxTd',
};
const cache = new Map();

async function fetchJson(url, options = {}) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error('Activity provider unavailable');
  return response.json();
}

async function loadPlatform(platform) {
  const cached = cache.get(platform);
  if (cached && cached.expires > Date.now()) return cached.data;

  let days;
  if (platform === 'github') {
    const data = await fetchJson(`https://github-contributions-api.jogruber.de/v4/${profiles.github}?y=last`);
    if (!Array.isArray(data.contributions)) throw new Error('Invalid GitHub calendar');
    days = data.contributions.map(({ date, count }) => ({ date, count }));
  } else {
    const year = new Date().getUTCFullYear();
    const data = await fetchJson('https://leetcode.com/graphql/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query($username: String!, $year: Int!, $previous: Int!) {
          matchedUser(username: $username) {
            current: userCalendar(year: $year) { submissionCalendar }
            previous: userCalendar(year: $previous) { submissionCalendar }
          }
        }`,
        variables: { username: profiles.leetcode, year, previous: year - 1 },
      }),
    });
    const user = data.data?.matchedUser;
    if (data.errors || !user?.current || !user?.previous) throw new Error('Invalid LeetCode calendar');
    const calendar = {
      ...JSON.parse(user.previous.submissionCalendar),
      ...JSON.parse(user.current.submissionCalendar),
    };
    days = Object.entries(calendar).map(([timestamp, count]) => ({
      date: new Date(Number(timestamp) * 1000).toISOString().slice(0, 10),
      count: Number(count),
    }));
  }
  if (days.some(({ date, count }) => !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(count) || count < 0)) {
    throw new Error('Invalid activity data');
  }
  const data = { days };
  cache.set(platform, { data, expires: Date.now() + 3600000 });
  return data;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const results = await Promise.allSettled(['github', 'leetcode'].map(loadPlatform));
  const data = Object.fromEntries(results.map((result, index) => [
    index === 0 ? 'github' : 'leetcode',
    result.status === 'fulfilled' ? result.value : { error: 'Activity is temporarily unavailable. Please try again.' },
  ]));
  return res.status(200).json(data);
}
