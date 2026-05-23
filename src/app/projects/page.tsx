'use client';

import React, { useState } from 'react';
import ProjectLink from '@/app/projects/projectLink';
import Modal from '@/app/projects/project/modal';
import Layout from '@/components/layout';
import { ModalContext } from './modalContext';

const projects = [
  {
    title: 'empty placeholder',
    src: 'TJHSST.png',
    tag: 'short description here',
    color: '#f4f4f5'
  },
  {
    title: 'empty placeholder',
    src: 'TJHSST.png',
    tag: 'short description here',
    color: '#f4f4f5'
  },
  {
    title: 'empty placeholder',
    src: 'TJHSST.png',
    tag: 'short description here',
    color: '#f4f4f5'
  },
  {
    title: 'empty placeholder',
    src: 'TJHSST.png',
    tag: 'short description here',
    color: '#f4f4f5'
  },
  {
    title: 'empty placeholder',
    src: 'TJHSST.png',
    tag: 'short description here',
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
