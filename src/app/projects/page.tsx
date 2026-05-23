'use client';

import React, { useState } from 'react';
import ProjectLink from '@/app/projects/projectLink';
import Modal from '@/app/projects/project/modal';
import Layout from '@/components/layout';
import { ModalContext } from './modalContext';

const projects = [
  {
    title: 'Websites Built',
    src: 'TJHSST.png',
    tag: 'Web development',
    color: '#f4f4f5'
  },
  {
    title: 'Slideshow Projects',
    src: 'TJHSST.png',
    tag: 'Presentation design',
    color: '#f4f4f5'
  },
  {
    title: 'Branding & Design',
    src: 'TJHSST.png',
    tag: 'Visual identity',
    color: '#f4f4f5'
  },
  {
    title: 'Competition Wins',
    src: 'TJHSST.png',
    tag: 'Awards & recognition',
    color: '#f4f4f5'
  },
  {
    title: 'Case Studies',
    src: 'TJHSST.png',
    tag: 'Problem · solution · impact',
    color: '#f4f4f5'
  }
];

export default function ProjectsHome() {
  const [modal, setModal] = useState({ active: false, index: 0 });
  return (
    <ModalContext.Provider value={{ modal, setModal }}>
      <Layout title={'Our Projects'}>
        <div className="m-0">
          <div className="m-0 overflow-hidden">
            {projects.map((project, index) => {
              return (
                <ProjectLink
                  key={index}
                  index={index}
                  title={project.title}
                  tag={project.tag}
                />
              );
            })}
          </div>
          <Modal projects={projects} />
        </div>
      </Layout>
    </ModalContext.Provider>
  );
}
