<template>
  <div class="feedParentContainer">
    <div class="nothingDefault"> 
      <img v-if="nothing" :src="nothing" />
    </div>
    <div v-if="!nothing" :class="{fixed: !showTop, noFixed: showTop}"/>
    <mt-loadmore
      v-if="!nothing"
      :bottom-method="loadBottom"
      :top-method="loadTop"
      :bottom-all-loaded="bottomAllLoaded"
      :top-all-loaded="topAllLoaded"
      ref="loadmore"
      bottomPullText="上拉加载更多动态"
      bottomDropText="释放加载更多动态"
      topPullText="下拉更新动态"
      topDropText="释放更新动态"
      :bottomDistance="70"
    >
      <div class="feed-list" v-if="!nothing">
        <Feed v-for="(feed, index) in feedsList" :feed="feed" :key="feed.feed.feed_id"></Feed>
      </div>
    </mt-loadmore>
  </div>
</template>
<script>
  import request, { createAPI, addAccessToken } from '../utils/request';
  import errorCodes from '../stores/errorCodes';
  import localEvent from '../stores/localStorage';
  import Feed from './Feed';
  import { NOTICE, FEEDSLIST, FOLLOWINGFEEDS, FOLLOWINGIDS, HOTIDS, NEWIDS, HOTFEEDS, NEWFEEDS, ADDFOLLOWINGIDS, ADDHOTIDS, ADDNEWIDS, COLLECTIONIDS, COLLECTIONFEEDS, ADDCOLLECTIONIDS } from '../stores/types';
  import router from '../routers/index';
  import lodash from 'lodash';
  import { resolveImage } from '../utils/resource';

  const nothingImg = resolveImage(require('../statics/images/defaultNothingx3.png'));

  const FeedLists = {
    components: {
      Feed
    },
    props: {
      option: Object
    },
    data: () => ({
      feeds: [],
      maxId: 0, // 更新查询用 最新和关注用
      page: 1, // 更新查询用 热门动态
      limit: 15,
      errors: {},
      limitCounter: 0,
      bottomAllLoaded: false,
      topAllLoaded: false,
      bottomStatus: '',
      isShowComfirm: false,
      showTop: true,
      firstId: 0, // 下拉刷新过滤节点
      feedType: { // vuex相关action
        'following': {
          ids: FOLLOWINGIDS,
          feeds: FOLLOWINGFEEDS,
          add: ADDFOLLOWINGIDS
        },
        'hot': {
          ids: HOTIDS,
          feeds: HOTFEEDS,
          add: ADDHOTIDS
        },
        'new': {
          ids: NEWIDS,
          feeds: NEWFEEDS,
          add: ADDNEWIDS
        },
        'collections': {
          ids: COLLECTIONIDS,
          feeds: COLLECTIONFEEDS,
          add: ADDCOLLECTIONIDS
        }
      }
    }),
    methods: {
      // 加载更多
      loadBottom () {
        let limiterSend = '';
        let api = this.option.uri; // 查询地址
        let limiter = this.option.limiter; // 分页查询方式
        if( this.maxId == 0) {
          return ;
        }
        if(limiter == 'page') {
          this.page += 1;
          limiterSend = `?page=${this.page}`;
        } else {
          limiterSend = `?max_id=${this.maxId}`;
        }
        addAccessToken().get(createAPI(`${api}${limiterSend}`), {},
          {
            validate: status  => status === 200
          }
        )
        .then(response => {
          let type = this.feedType[this.option.type];
          let data = response.data.data;
          let length = data.length;
          if(length == 0) {
            setTimeout(() => {
              if(this.$refs.loadmore)
              this.$refs.loadmore.onBottomLoaded();
              // this.$refs.loadmore.onTopLoaded();
            }, 500)
            return;
          }
          let ids = [];
          let feeds = {};
          data.forEach((d) => {
            ids.push(d.feed.feed_id);
            feeds[d.feed.feed_id] = d;
          });
          this.$store.dispatch(FEEDSLIST, cb => {
            cb(feeds);
          })
          this.$store.dispatch(type.ids, cb => {
            cb(ids);
          })
          if(length < 15) {
            this.bottomAllLoaded = true;
          }
          this.maxId = data[data.length - 1].feed.feed_id;
          setTimeout(() => {
            if(this.$refs.loadmore)
              this.$refs.loadmore.onBottomLoaded();
            // this.$refs.loadmore.onTopLoaded();
          }, 500)
        })
      },
      loadTop () {
        let limiterSend = '';
        let api = this.option.uri;
        let limiter = this.option.limiter;
        let type = this.feedType[this.option.type];
        let currentType = this.option.type; // 区分当前为哪种列表分类
        let ids = this.$store.getters[type.ids];
        if (limiter == 'page') {
          this.limitCounter = 1;
          limiterSend = '?page=1';
        }
        addAccessToken().get(createAPI(`${api}${limiterSend}`), {}, 
          {
            validate: status  => status === 200
          }
        )
        .then( response => {
          let feeds = response.data.data;
          if(feeds.length == 0) {
            setTimeout(() => {
              if(this.$refs.loadmore)
              {
                // this.$refs.loadmore.onBottomLoaded();
                this.$refs.loadmore.onTopLoaded();
              }
            }, 500)
            return;
          }
          let newIds = [];
          let newFeeds = {};
          feeds.forEach( feed => {
            if(ids.findIndex(function(value, index, arr) {
              return value == feed.feed.feed_id;
            }) == -1) {
              newIds.push(feed.feed.feed_id);
            }
            newFeeds[feed.feed.feed_id] = feed;
          });
          this.$store.dispatch(FEEDSLIST, cb => {
            cb(newFeeds);
          });
          this.$store.dispatch(type.add, cb => {
            cb(newIds);
          });
          newFeeds = {};
          newIds = [];
          feeds = [];
          setTimeout(() => {
            if(this.$refs.loadmore) {
              this.$refs.loadmore.onTopLoaded();
              // this.$refs.loadmore.onBottomLoaded();
            }
          }, 500)
        });
        setTimeout(() => {
          if(this.$refs.loadmore)
          this.$refs.loadmore.onTopLoaded();
        }, 500)
      }
    },
    computed: {
      error: function () {
        let errors = lodash.values(this.errors);
        return errors[0] || '';
      },
      nothing () {
        let type = this.feedType[this.option.type];
        let feedList = this.$store.getters[type.ids];
        return feedList.length ? 0 : nothingImg;
      },
      feedsList() {
        let type = this.feedType[this.option.type];
        return this.$store.getters[type.feeds];
      }
    },
    mounted () {
      let type = this.feedType[this.option.type];
      let storeIds = this.$store.getters[type.ids];
      if(storeIds.length) {
        this.firstId = storeIds[0];
        this.maxId = storeIds[storeIds.length -1];
        this.showTop = false;
        setTimeout(() => {
          if(this.$refs.loadmore){
            this.$refs.loadmore.onTopLoaded();
            // this.$refs.loadmore.onBottomLoaded();
          }
        }, 500);
        storeIds = [];
        return;
      }
      let limiterSend = '';
      let api = this.option.uri;
      let limiter = this.option.limiter;
      if (limiter == 'page') {
        this.limitCounter = 1;
        limiterSend = '?page=1';
      }
      addAccessToken().get(createAPI(`${api}${limiterSend}`), 
        {}, 
        {
          validate: status  => status === 200
        }
      )
      .then(response => {
        let feeds = response.data.data;
        let storeFeeds = {};
        let ids = [];
        this.firstId = feeds[0].feed.feed_id;
        feeds.forEach( feed => {
          ids.push(feed.feed.feed_id);
          storeFeeds[feed.feed.feed_id] = feed;
        });
        this.$store.dispatch(FEEDSLIST, cb => {
          cb(storeFeeds);
        })
        this.$store.dispatch(type.ids, cb => {
          cb(ids);
        })
        let lastFeed = feeds[feeds.length - 1];
        this.maxId = lastFeed.feed.feed_id;
        if(feeds.length < 15) {
          this.bottomAllLoaded = true;
        }
        feeds = [];
      })
    },
    updated () {
      this.showTop = false;
      setTimeout(() => {
        if(this.$refs.loadmore){
          this.$refs.loadmore.onTopLoaded();
        }
      }, 500);
    }
  };

  export default FeedLists;
</script>

<style lang="scss" module>
  .notice {
    padding: 10px 0;
    height: 18px;
    background-color: #59b6d7;
    color: #fff;
    text-align: center;
    line-height: 18px;
  }
</style>
<style scoped>
  .mint-loadmore {padding-bottom: 60px}
  .mint-loadmore-content-parent-no-trans .mint-loadmore-content {
    transform: inherit;
  }
  .noFixed {
    height: 55px;
    display: none;
  }
  .fixed {
    height: 55px;
    display: block;
  }
</style>
