import localEvent from '../stores/localStorage';
import { createAPI, addAccessToken } from '../utils/request';
import errorCodes from '../stores/errorCodes';
import getImage from './getImage';
import defaultAvatar from '../statics/images/defaultAvatarx2.png';
import lodash from 'lodash';

function followingUser(user_id, cb) {
  addAccessToken().post(
    createAPI('users/follow'),
    {
      user_id
    },
    {
      validate: status => status === 200
    }
  )
  .then(response => {
    cb(response.data);
  })
};

function unFollowingUser(user_id, cb) {
  addAccessToken().delete(
    createAPI(`users/unFollow?user_id=${user_id}`),
    {},
    {
      validate: status => status === 204
    }
  )
  .then(response => {
    cb(response.data);
  })
};

function getAvatar (userInfo, process, cb) {
  // 已有本地用户
  userInfo.avatar = {};
  if(userInfo.hasOwnProperty('datas')) { // 有datas属性
    if(userInfo.datas.hasOwnProperty('avatar')) { // 有avatar属性
      if(userInfo.datas.avatar.hasOwnProperty('value')) { // 有上传过avatar
        if(userInfo.datas.avatar.hasOwnProperty('urls')) { // 没有本地图片
          if(!userInfo.datas.avatar.urls.hasOwnProperty(process)) {
            userInfo.datas.avatar.urls[process] = userInfo.avatar[process] = getImage(userInfo.datas.avatar.value, process);
          }
        } else {
          userInfo.datas.avatar.urls = {};
          userInfo.datas.avatar.urls[process] = userInfo.avatar[process] = getImage(userInfo.datas.avatar.value, process);
        }
      } else {
        userInfo.datas.avatar.urls = {};
        userInfo.datas.avatar.urls[process] = userInfo.avatar[process] = defaultAvatar;
      }
    } else {
      userInfo.datas.avatar = {};
      userInfo.datas.avatar.urls = {};
      userInfo.datas.avatar.urls[process] = userInfo.avatar[process] = defaultAvatar;
    }
  } else { // 没有本地用户
    userInfo.datas.avatar = {};
    userInfo.datas.avatar.urls = {};
    userInfo.datas.avatar.urls[process] = userInfo.avatar[process] = defaultAvatar;
  }
  cb(userInfo);
};

function getUserInfo (user_id, process = 30) {
  return new Promise( (resolve, reject) => {
    addAccessToken().post(createAPI('users'), {
        user_ids: [ user_id ]
      },
      {
        validate: status => status === 200
      }
    )
    .then(response => {
      let user = response.data.data.pop();
      let userLocal = {
        user_id: 0,
        name: '',
        phone: '',
        counts: {},
        datas: {},
        is_following: 0,
        is_followed: 0
      };
      userLocal.user_id = user.id;
      userLocal.name = user.name;
      userLocal.phone = user.phone;
      userLocal.is_followed = user.is_followed ? user.is_followed : 0;
      userLocal.is_following = user.is_following ? user.is_following : 0;
      user.counts.map(function (count, index) {
        let keyName = count.key;
        let value = count.value;
        userLocal.counts = { ...userLocal.counts, [keyName]:  value };
      });
      let newData = {};
      user.datas.forEach(data => {
        newData[data.profile] = {
          display: data.profile_name,
          value: data.pivot.user_profile_setting_data,
          type: data.type,
          options: data.default_options,
          updated_at: data.updated_at
        };
      });
      userLocal.datas = newData;
      getAvatar(userLocal, process, newUserLocal => {
        userLocal = newUserLocal;
      });
      localEvent.setLocalItem('user_' + user_id, userLocal);
      resolve(userLocal);
    })
  })
};

function getUsersInfo (user_ids, cb) {
  let user_ids_need_to_request = [];
  let users = {};

  // 检查已有的本地用户
  user_ids.map((user_id) => {
    let oldUserLocal = localEvent.getLocalItem(`user_${user_id}`);
    if(!lodash.keys(oldUserLocal).length) {
      user_ids_need_to_request.push(user_id);
    }
    users[user_id] = oldUserLocal;
  });
  if(user_ids_need_to_request.length) {
    addAccessToken().post(createAPI('users'), {
        user_ids: user_ids_need_to_request
      },
      {
        validate: status => status === 200
      }
    )
    .then(response => {
      let users_service = response.data.data;
      let userLocal = {
        user_id: 0,
        name: '',
        phone: '',
        counts: {},
        datas: {},
        avatar: ''
      };
      // 组装数据
      users_service.map((user) => {
        let current_local_user = { ...userLocal };
        current_local_user.user_id = user.id;
        current_local_user.name = user.name;
        current_local_user.phone = user.phone;
        if(user.counts.length) {
          user.counts.map((count) => {
            let keyName = count.key;
            let value = count.value;
            current_local_user.counts = { ...current_local_user.counts, ...{ [keyName]:  value } };
          });
        }
        if(user.datas.length) {
          let newData = {};
          user.datas.forEach(data => {
            newData[data.profile] = {
              display: data.profile_name,
              value: data.pivot.user_profile_setting_data,
              type: data.type,
              options: data.default_options,
              updated_at: data.updated_at
            };
          });
          current_local_user.datas = newData;
        }
        getAvatar(current_local_user, 30, newUserLocal => {
          current_local_user = newUserLocal;
        });
        localEvent.setLocalItem('user_' + current_local_user.user_id, current_local_user);
        users[user.id] = current_local_user;
      });
      if(cb instanceof Function ) {
        cb(users);
      }
    })
  } else {
    // 返回本地数据
    if(cb instanceof Function) 
      cb(users);
  }
};

export {
  getUserInfo,
  getUsersInfo,
  getAvatar,
  unFollowingUser,
  followingUser
};