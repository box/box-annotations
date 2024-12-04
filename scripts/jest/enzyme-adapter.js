import 'core-js/es/map';
import 'core-js/es/set';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from '@cfaester/enzyme-adapter-react-18';

Enzyme.configure({ adapter: new Adapter() });

// make Enzyme functions available in all test files without importing
global.shallow = shallow;
global.mount = mount;
