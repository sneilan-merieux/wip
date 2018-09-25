import React from 'react';
import { render } from 'react-dom';
import Toolbar from './Toolbar';

const root = document.createElement('div');
document.body.prepend(root);

render(<Toolbar />, root);




