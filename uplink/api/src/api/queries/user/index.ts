import getActivity from './getActivity';
import getUsers from './rootUsers';
import getUserByPhysicalPhone from './rootUserPhysicalPhone';
import phoneNumber from './phoneNumber';

export default {
  Query: {
    getActivity,
    getUsers,
    getUserByPhysicalPhone,
  },
  User: {
    phoneNumber,
  },
};
