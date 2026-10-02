/* ==========================================================================
   MVP Reels — per-athlete data file
   This is the ONLY file edited when onboarding a new athlete.
   Everything visible on the page is read from this object by js/app.js.
   ========================================================================== */

const athleteData = {

  /* Accent colour of the page. Any valid CSS colour (#CCFF00, rgb(), hsl()). */
  theme: {
    accent: "#CCFF00"
  },

  /* Discord or n8n webhook that receives the recruiter form.
     Leave "" to run in demo mode: the payload is logged to the console
     after 700ms and the success message is shown without sending anything. */
  webhookUrl: "",

  profile: {
    name: "Devin Marsh",
    position: "Point Guard / WR",
    classYear: "2026",
    jerseyNumber: "04",
    school: "Oakridge High School",
    location: "Dallas, Texas",
    resumeUrl: "assets/resume.pdf",   // athletic CV, dropped into assets/
    heroPoster: "",                   // optional still image shown instead of the video
    heroVideoBg: "https://videos.pexels.com/video-files/5586521/5586521-hd_1280_720_25fps.mp4"
  },

  /* label = column heading, value = big number, detail = muted line under the label */
  physicals: [
    { label: "Height", value: "6'2\"", detail: "Without shoes, measured August 2025" },
    { label: "Weight", value: "185 lbs", detail: "Body composition checked monthly" },
    { label: "Wingspan", value: "6'6\"", detail: "Standing reach 8'3\"" },
    { label: "Vertical", value: "34 in", detail: "Max vertical, two-foot takeoff" },
    { label: "40-yard dash", value: "4.52 s", detail: "Hand timed on turf, April 2025" }
  ],

  academics: {
    gpa: "3.8",
    sat: "1280",
    act: "27",
    major: "Sports marketing",
    ncaaId: "2401187352"
  },

  /* category drives the film room tabs: "Full reel", "Game film", "Workouts".
     Entries without a category or a youtubeId are skipped.
     duration is the badge text; leave "" to hide the badge. */
  videos: [
    {
      id: 1,
      category: "Full reel",
      title: "Junior season mixtape, 2025",
      youtubeId: "ljyyR5WZZc4",
      duration: "4:43"
    },
    {
      id: 2,
      category: "Game film",
      title: "vs. Lakeview Central, district semifinal",
      youtubeId: "uHPMjbU3LGg",
      duration: "8:59"
    },
    {
      id: 3,
      category: "Workouts",
      title: "Summer shooting and agility block",
      youtubeId: "eQjC8RCD4KU",
      duration: "7:06"
    }
  ],

  accolades: [
    "District 11-5A co-MVP, 2025 season",
    "All-district first team, 2024 and 2025",
    "State 6A semifinalist, 2025",
    "Oakridge Scholar-Athlete Award, 2025"
  ],

  coaches: [
    {
      name: "Marcus Bell",
      title: "Head boys basketball coach, Oakridge High School",
      phone: "(214) 555-0148",
      email: "m.bell@oakridgehs.example"
    }
  ],

  social: [
    { label: "Hudl", url: "https://www.hudl.com" },
    { label: "Instagram", url: "https://www.instagram.com" },
    { label: "X", url: "https://x.com" }
  ]
};
