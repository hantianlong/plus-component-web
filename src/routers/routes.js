/* views */
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import FindPassword from '../views/FindPassword.vue';
import Feeds from '../views/Feeds.vue';
import Home from '../views/Home.vue';
import FeedFollowing from '../views/FeedFollowing';
import FeedHot from '../views/FeedHot';
import FeedNew from '../views/FeedNew';
import FeedDetail from '../views/FeedDetail';
import Profile from '../views/Profile';
import SystemSetting from '../views/SystemSetting';
import ChangePassword from '../views/ChangePassword';
import UserSetting from '../views/UserSetting';
import UserFeeds from '../views/UserFeeds';
import Message from '../views/Message';
import Ranking from '../views/Ranking';
import Comments from '../views/Comments';
import Diggs from '../views/Diggs';
import Collections from '../views/Collections';
import Discover from '../views/Discover';
import { requestAuth, CanNotGetInWhenLogged } from '../utils/auth';

const routes = [
  {
    path: '/',
    redirect: '/login',
    meta: {
      title: 'ThinkSNS+'
    }
  },
  {
    path: '/login',
    component: Login,
    name: 'login',
    meta: {
      title: '登录'
    },
    beforeEnter: (to, from, next) => {
      CanNotGetInWhenLogged(to, from, next)
    }
  },
  {
    path: '/register',
    component: Register,
    name: 'register',
    meta: {
      title: '注册'
    },
    beforeEnter: (to, from, next) => {
      CanNotGetInWhenLogged(to, from, next)
    }
  },
  {
    path: '/findpassword',
    component: FindPassword,
    name: 'findPassword',
    meta: {
      title: '找回密码'
    },
    beforeEnter: (to, from, next) => {
      CanNotGetInWhenLogged(to, from, next)
    }
  },
  {
    path: '/feeds',
    component: Feeds,
    name: 'feedsList',
    meta: {
      title: '动态'
    },
    beforeEnter: (to, from, next) => {
      requestAuth(to, from, next)
    },
    redirect: '/feeds/following',
    children: [
      {
        path: 'following',
        component: FeedFollowing,
        name: 'followingFeeds',
        meta: {
          title: '关注的动态'
        }
      },
      {
        path: 'hot',
        component: FeedHot,
        name: 'hotFeeds',
        meta: {
          title: '热门动态'
        }
      },
      {
        path: 'new',
        component: FeedNew,
        name: 'newFeeds',
        meta: {
          title: '最新动态'
        }
      }
    ]
  },
  {
    path: '/feed/:feed_id',
    component: FeedDetail,
    name: 'feedDetail',
    meta: {
      title: '动态详情'
    }
  },
  {
    path: '/users/feeds/:user_id',
    component: UserFeeds,
    name: 'userSpace',
    meta: {
      title: '个人主页'
    },
    beforeEnter: (to, from, next) => {
      requestAuth(to, from, next);
    }
  },
  {
    path: '/discover',
    component: Discover,
    meta: {
      title: '发现'
    }
  },
  {
    path: '/users/message',
    component: Message,
    name: 'myMessage',
    meta: {
      title: '消息'
    },
    beforeEnter: (to, from, next) => {
      requestAuth(to, from, next)
    }
  },
  {
    path: '/users/diggs',
    component: Diggs,
    name: 'myDiggs',
    meta: {
      title: '赞'
    },
    beforeEnter: (to, from, next) => {
      requestAuth(to, from, next)
    }
  },
  {
    path: '/users/ranking',
    component: Ranking,
    name: 'diggRanking',
    meta: {
      title: '排行榜'
    },
    beforeEnter: (to, from, next) => {
      requestAuth(to, from, next)
    }
  },
  {
    path: '/users/mycomments',
    component: Comments,
    name: 'myComments',
    meta: {
      title: '评论'
    },
    beforeEnter: (to, from, next) => {
      requestAuth(to, from, next)
    }
  },
  {
    path: '/users/collections',
    component: Collections,
    name: 'myCollections',
    meta: {
      title: '收藏'
    },
    beforeEnter: (to, from, next) => {
      requestAuth(to, from, next)
    }
  },
  {
    path: '/users/profile',
    component: Profile,
    name: 'myProfile',
    meta: {
      title: '我'
    },
    beforeEnter: (to, from, next) => {
      requestAuth(to, from, next)
    }
  },
  {
    path: '/users/systemSetting',
    component: SystemSetting,
    name: 'systemSetting',
    meta: {
      title: '设置'
    },
    beforeEnter: (to, from, next) => {
      requestAuth(to, from, next)
    }
  },
  {
    path: '/users/password',
    component: ChangePassword,
    name: 'changePassword',
    meta: {
      title: '修改密码'
    },
    beforeEnter: (to, from, next) => {
      requestAuth(to, from, next);
    }
  },
  {
    path: '/users/setting',
    component: UserSetting,
    name: 'mySetting',
    meta: {
      title: '个人资料',
      keywords: '个人资料'
    },
    beforeEnter: (to, from, next) => {
      requestAuth(to, from, next);
    }
  },
];

export default routes;
