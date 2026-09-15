export type EventCategory = 'Workshop' | 'Drive' | 'Meetup' | 'Fundraiser' | 'Campaign';
export type GucEvent = { id:string; date:string; title:string; category:EventCategory; overview:string; location:string };
// EDIT THIS FILE TO ADD / REMOVE EVENTS.
export const EVENTS:GucEvent[]=[
{id:'leadership-lab-oct',date:'2026-10-03',title:'Leadership Lab: Own the Room',category:'Workshop',overview:'A hands-on session on public speaking, negotiation, and taking up space without apology.',location:'GUC Studio / venue to be confirmed'},
{id:'health-camp-oct',date:'2026-10-11',title:'Community Health & Dignity Drive',category:'Drive',overview:'A neighbourhood outreach day focused on menstrual health, dignity kits, and trusted referrals.',location:'Community centre, Kolkata'},
{id:'mentor-meet-nov',date:'2026-11-07',title:'Mentor Circle: Study to Startup',category:'Meetup',overview:'Young women meet mentors from education, technology, media, and entrepreneurship.',location:'Partner campus / venue to be confirmed'},
{id:'fundraiser-nov',date:'2026-11-21',title:'Night of Ideas Fundraiser',category:'Fundraiser',overview:'An evening of performances, stories, and small actions that directly fund community programmes.',location:'Kolkata, venue to be confirmed'},
{id:'safety-week-dec',date:'2026-12-05',title:'Safer Streets Campaign Launch',category:'Campaign',overview:'Launching a youth-led campaign for safer routes, reporting literacy, and community accountability.',location:'Central Kolkata / route to be confirmed'}];
