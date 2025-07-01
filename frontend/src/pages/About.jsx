import React from "react";
import Layout from '../components/common/Layout';

// LinkedIn SVG Icon
const LinkedInIcon = () => (
  <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24" className="inline-block align-middle">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.026-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.841-1.563 3.039 0 3.6 2.001 3.6 4.601v5.595z"/>
  </svg>
);

const StackTamers = [
  {
    name: "Mr. Imandi Sai Ganesh",
    role: "Developer",
    img: "https://media.licdn.com/dms/image/v2/D5635AQH0C5LEGJXWmw/profile-framedphoto-shrink_400_400/profile-framedphoto-shrink_400_400/0/1722458915775?e=1751446800&v=beta&t=tMzotsJo0LkGYAYi59goinLD0Ask_rRtugGhPLuvcW0",
    linkedin: "https://www.linkedin.com/in/sai-ganesh-91505a261/",
  },
  {
    name: "Mr. Arihant Rastogi",
    role: "Developer",
    img: "https://media.licdn.com/dms/image/v2/D4E03AQHaK1cTkAM1Yg/profile-displayphoto-shrink_400_400/B4EZRpSmrQGwAg-/0/1736933273141?e=1755734400&v=beta&t=h8MoPZ1bsLWTqmHzvtc-mQYUGu9xo4Hj2_kBk6IUMYw",
    linkedin: "https://www.linkedin.com/in/arihant-rastogi-7605942aa/",
  },
  {
    name: "Mr. Vishnu Sathwik",
    role: "Developer",
    img: "https://media.licdn.com/dms/image/v2/D5603AQGVpjK5b5RLXA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1720800726964?e=1755734400&v=beta&t=B7qhu0SSOsnFAf-zXnYNAjb2zn-6IJj3Kk3vS7JUXOc",
    linkedin: "https://www.linkedin.com/in/vishnu-sathwik-14117a257/",
  },
];

const ProjectManagers = [
  {
    name: "Dr. Lakshmanan Nataraj",
    role: "Project Manager",
    img: "https://media.licdn.com/dms/image/v2/C4E03AQFXoEyinscBjg/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1517722429220?e=1755734400&v=beta&t=7iZJ_IHunUhTbrT9LjGRQWqbwVKoT7-v-KJOEfaJcYU",
    linkedin: "https://www.linkedin.com/in/lakshmanannataraj/",
  },
  {
    name: "Mr. Rahul Sundar",
    role: "Project Manager",
    img: "https://media.licdn.com/dms/image/v2/D5603AQH0_OyMlWU9pQ/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1700078431294?e=1755734400&v=beta&t=jq8M3JPtAfK_VQVk944J8CndfENNOPR27VcXc6nuOAc",
    linkedin: "https://www.linkedin.com/in/rahul-sundar-311a6977/",
  },
];

const PrincipalInvestigator = [
  {
    name: "Prof. Ponnurangam Kumaraguru (PK)",
    role: "Principal Investigator",
    img: "https://media.licdn.com/dms/image/v2/D4D03AQH8s-lGTzOp6g/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1728189506590?e=1755734400&v=beta&t=-uHTUc09xW9cnSlup1TIqqAkWRP1ozv3qlrw3Jm0epg",
    linkedin: "https://www.linkedin.com/in/ponguru/",
  },
];

function TeamGrid({ title, members }) {
  return (
    <div className="mb-12">
      <h3 className="text-2xl font-bold mb-8 text-gray-800 dark:text-gray-200 text-center">{title}</h3>
      <div className="flex flex-wrap justify-center gap-10">
        {members.map((member) => (
          <div
            key={member.name}
            className="flex flex-col items-center bg-white/80 dark:bg-gray-900/80 shadow-xl rounded-3xl p-8 min-w-[270px] max-w-[320px] transition-transform hover:scale-105"
          >
            <img
              src={member.img}
              alt={member.name}
              className="w-40 h-40 rounded-full mb-6 object-cover border-4 shadow-lg"
            />
            <div className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-center mb-1">{member.name}</div>
            <div className="text-base text-gray-600 dark:text-gray-400 mb-3 text-center">{member.role}</div>
            <a
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              aria-label={`LinkedIn profile of ${member.name}`}
            >
              <LinkedInIcon />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function About() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center">
        {/* About Section */}
        <section className="mb-16 w-full text-center">
          <h1 className="text-5xl font-extrabold mb-6 text-gray-900 dark:text-gray-100 tracking-tight">About Us</h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            We at <span className="font-bold text-blue-600 dark:text-blue-400">SARAL</span> aim to democratise research by making your research workflows smoother, faster and accessible with the help of AI integrated tools.
          </p>
        </section>

        {/* Team Section */}
        <section className="mb-16 w-full">
          <h2 className="text-4xl font-bold mb-10 text-gray-900 dark:text-gray-100 text-center">Our Team</h2>
          <TeamGrid title="Stack Tamers" members={StackTamers} />
          <TeamGrid title="Project Managers" members={ProjectManagers} />
          <TeamGrid title="Principal Investigator" members={PrincipalInvestigator} />
        </section>

        {/* Contact Section */}
        <section className="w-full text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Contact</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-3">
            Have questions or want to work with us?
          </p>
          <a
            href="mailto:democratise.research@gmail.com"
            className="inline-block mt-2 px-7 py-3 bg-blue-600 text-white rounded-full font-semibold shadow hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Email Us
          </a>
        </section>
      </div>
    </Layout>
  );
}