import { FOLLOWINGIDS, ADDFOLLOWINGIDS } from '../types';

const sort = function(a, b) {
  return b - a;
}

const state = {
  followingIds: []
};

const mutations = {
  [FOLLOWINGIDS] (state, ids) {
    state.followingIds = [ ...state.followingIds, ...ids ];
  },
  [ADDFOLLOWINGIDS] (state, ids) {
    let followingIds = [ ...ids, ...state.followingIds ];
    state.followingIds = followingIds.sort(sort);
  }
};

const actions = {
  [FOLLOWINGIDS]: (context, cb) => {
    cb( ids => {
      context.commit(FOLLOWINGIDS, ids);
    })
  },
  [ADDFOLLOWINGIDS]: (context, cb) => {
    cb( ids => {
      context.commit(ADDFOLLOWINGIDS, ids);
    })
  }
};

const getters = {
  [FOLLOWINGIDS]: state => {
    return state.followingIds
  }
}

const store = {
  state,
  mutations,
  actions,
  getters
};

export default store;