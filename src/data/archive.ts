export type ArchiveImage={id:string;src:string;alt:string};export type ArchiveEvent={id:string;name:string;images:ArchiveImage[]};export type ArchiveMonth={month:string;events:ArchiveEvent[]};export type ArchiveYear={year:string;months:ArchiveMonth[]};
export const ARCHIVE:ArchiveYear=[
{year:'2026',months:[{month:'September',events:[{id:'community-kickoff',name:'Community Kickoff',images:[
{id:'k1',src:'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=72',alt:'Young volunteers gathering outdoors'},
{id:'k2',src:'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=72',alt:'Community collaboration'},
{id:'k3',src:'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=72',alt:'Students working together'}]}]},
{month:'August',events:[{id:'back-to-school',name:'Back to School Resource Day',images:[
{id:'b1',src:'https://images.unsplash.com/photo-1491308056676-205b7c9a7dc0?auto=format&fit=crop&w=1200&q=72',alt:'Students in a learning environment'},
{id:'b2',src:'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=72',alt:'Students studying together'}]}]}]},
{year:'2025',months:[{month:'December',events:[{id:'year-end-circle',name:'Year-End Circle',images:[]}]}]}];
