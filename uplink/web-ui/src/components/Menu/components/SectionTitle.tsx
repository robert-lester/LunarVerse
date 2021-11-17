import * as React from 'react';

import './SectionTitle.scss';

interface Props {
  title: string;
}

export const SectionTitle = ({ title }: Props) =>
  <h4 className="l-menu-section-title">{title}</h4>;