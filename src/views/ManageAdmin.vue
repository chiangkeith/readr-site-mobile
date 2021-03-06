<template>
  <div class="admin">
    <div class="admin__container">
      <aside class="admin__aside">
        <AppAsideNav/>
      </aside>
      <main class="admin__main">
        <!-- <app-header :sections="sections"></app-header> -->
        <About :profile="profile"></About>
        <div class="control-bar">
          <TheControlBar
            @addAccount="addMember"
            @addNews="showEditorHandler({ postPanel: 'add', postType: config.type.NEWS })"
            @addReview="showEditorHandler({ postPanel: 'add', postType: config.type.REVIEW })"
            @addVideo="showEditorHandler({ postPanel: 'add', postType: config.type.VIDEO })"
            @editNews="showDraftListHandler(config.type.NEWS)"
            @editReview="showDraftListHandler(config.type.REVIEW)"
            @openPanel="openPanel">
          </TheControlBar>
        </div>
        <template v-if="activePanel === 'accounts'">
          <MembersPanel v-if="$can('memberManage')" @filterChanged="filterChanged"></MembersPanel>
        </template>
        <template v-else-if="activePanel === 'records'">
          <section class="">
            <app-tab :tabs="tabs" @changeTab="tabHandler">
              <PostListInTab
                slot="0"
                :posts="posts"
                @deletePost="showAlertHandler"
                @editPost="showEditorHandler"
                @filterChanged="filterChanged">
              </PostListInTab>
              <PostListInTab
                slot="1"
                :posts="posts"
                @deletePost="showAlertHandler"
                @editPost="showEditorHandler"
                @filterChanged="filterChanged">
              </PostListInTab>
              <FollowingListInTab
                slot="2"
                :currentResource="followingResource"
                :followingByUser="followingByUser"
                @changeResource="updateFollowingList"
                @unfollow="unfollow">
              </FollowingListInTab>
            </app-tab>
          </section>
        </template>
        <template v-else-if="activePanel === 'posts'">
          <section class="panel">
            <PostList
              :maxResult="20"
              :posts="posts"
              :sort="currSort"
              @deletePosts="showAlertHandler"
              @editPost="showEditorHandler"
              @filterChanged="filterChanged"
              @publishPosts="showAlertHandler">
            </PostList>
          </section>
        </template>
        <template v-else-if="activePanel === 'tags'">
          <section class="panel">
            <TagList
              :maxResult="20"
              :sort="currSort"
              :tags="tags"
              @addTag="addTag"
              @deleteTags="showAlertHandler"
              @filterChanged="filterChanged"
              @updateTagList="updateTagList({})">
            </TagList>
          </section>
        </template>
        <template v-else-if="activePanel === 'videos'">
          <section class="panel">
            <VideoList
              :maxResult="20"
              :posts="posts"
              :sort="currSort"
              @deletePosts="showAlertHandler"
              @editPost="showEditorHandler"
              @filterChanged="filterChanged"
              @publishPosts="showAlertHandler">
            </VideoList>
          </section>
        </template>
        <BaseLightBox borderStyle="nonBorder" :showLightBox.sync="showLightBox" :isConversation="true">
          <MemberAccountEditor
            action="add"
            :shouldShow="showLightBox"
            :title="$t('admin.WORDING_ADMIN_MEMBER_EDITOR_ADD_MEMBER')"
            @updated="filterChanged">
          </MemberAccountEditor>
        </BaseLightBox>
        <BaseLightBox :showLightBox.sync="showDraftList">
          <PostListDetailed
            :posts="postsDraft"
            @deletePost="showAlertHandler"
            @editPost="showEditorHandler">
          </PostListDetailed>
        </BaseLightBox>
        <BaseLightBox :showLightBox.sync="showEditor">
          <PostPanel
            :post="post"
            :panelType="postPanel"
            :postType="postType"
            @addPost="addPost"
            @deletePost="deletePost"
            @publishPost="publishPost"
            @updatePost="updatePost">
          </PostPanel>
        </BaseLightBox>
        <BaseLightBox :isAlert="true" :showLightBox.sync="showAlert">
          <AlertPanel
            :active="itemsActive"
            :activeChanged="postActiveChanged"
            :items="itemsSelected"
            :needConfirm="needConfirm"
            :showLightBox="showAlert"
            :type="alertType"
            @deletePosts="deletePosts"
            @deleteTags="deleteTags"
            @closeAlert="alertHandler(false)"
            @publishPosts="publishPostHandler">
          </AlertPanel>
        </BaseLightBox>
      </main>
    </div>
  </div>
</template>
<script>
  import { POST_ACTIVE, POST_TYPE, TAG_ACTIVE, } from '../../api/config'
  import { SECTIONS_DEFAULT, } from '../constants'
  import _ from 'lodash'
  import About from '../components/About.vue'
  import AlertPanel from '../components/AlertPanel.vue'
  import AppAsideNav from '../components/AppAsideNav.vue'
  import AppHeader from '../components/AppHeader.vue'
  import BaseLightBox from '../components/BaseLightBox.vue'
  import FollowingListInTab from '../components/FollowingListInTab.vue'
  import MemberAccountEditor from '../components/admin/MemberAccountEditor.vue'
  import MembersPanel from '../components/admin/MembersPanel.vue'
  import PostList from '../components/PostList.vue'
  import PostListDetailed from '../components/PostListDetailed.vue'
  import PostListInTab from '../components/PostListInTab.vue'
  import PostPanel from '../components/PostPanel.vue'
  import Tab from '../components/Tab.vue'
  import TagList from '../components/TagList.vue'
  import TheControlBar from '../components/TheControlBar.vue'
  import VideoList from '../components/VideoList.vue'

  const MAXRESULT = 20
  const DEFAULT_PAGE = 1
  const DEFAULT_SORT = '-updated_at'

  const addPost = (store, params) => {
    return store.dispatch('ADD_POST', { params, })
  }

  const addTags = (store, text = '') => {
    return store.dispatch('ADD_TAGS', {
      params: {
        text: text,
        updated_by: _.get(store, [ 'state', 'profile', 'id', ]),
      },
    })
  }

  const deletePosts = (store, { params, }) => {
    return store.dispatch('DELETE_POSTS', {
      params: params,
    })
  }

  const deleteTags = (store, ids = []) => {
    return store.dispatch('DELETE_TAGS', {
      params: {
        ids: ids,
        updated_by: _.get(store, [ 'state', 'profile', 'id', ]),
      },
    })
  }

  const getFollowing = (store, { subject, resource, resourceType = '', }) => {
    return store.dispatch('GET_FOLLOWING_BY_USER', {
      subject: subject,
      resource: resource,
      resource_type: resourceType,
    })
  }

  const getPosts = (store, {
    maxResult = MAXRESULT,
    page = DEFAULT_PAGE,
    sort = DEFAULT_SORT,
    where = {},
  } = {}) => {
    return store.dispatch('GET_POSTS', {
      params: {
        max_result: maxResult,
        page: page,
        sort: sort,
        where: where,
      },
    })
  }

  const getPostsByUser = (store, {
    maxResult = MAXRESULT,
    page = DEFAULT_PAGE,
    sort = DEFAULT_SORT,
    where = {},
  }) => {
    return store.dispatch('GET_POSTS_BY_USER', {
      params: {
        max_result: maxResult,
        page: page,
        sort: sort,
        where: where,
      },
    })
  }

  const getPostsCount = (store, params = {}) => {
    return store.dispatch('GET_POSTS_COUNT', {
      params: params,
    })
  }

  const getTags = (store, {
    max_result = MAXRESULT,
    page = DEFAULT_PAGE,
    sort = DEFAULT_SORT,
    keyword = '',
    stats = false,
  }) => {
    return store.dispatch('GET_TAGS', {
      params: {
        max_result: max_result,
        page: page,
        sort: sort,
        keyword: keyword,
        stats: stats,
      },
    })
  }

  const getTagsCount = (store) => {
    return store.dispatch('GET_TAGS_COUNT')
  }

  const getMembers = (store, { page, sort, }) => {
    return store.dispatch('GET_MEMBERS', {
      params: {
        max_result: MAXRESULT,
        page: page || DEFAULT_PAGE,
        sort: sort || DEFAULT_SORT,
      },
    })
  }

  const publishPosts = (store, params) => {
    return store.dispatch('PUBLISH_POSTS', { params, })
  }

  const unfollow = (store, resource, subject, object) => {
    return store.dispatch('PUBLISH_ACTION', {
      params: {
        action: 'unfollow',
        resource: resource,
        subject: subject,
        object: object,
      },
    })
  }

  const updatePost = (store, params) => {
    return store.dispatch('UPDATE_POST', { params, })
  }

  export default {
    name: 'admin-page',
    components: {
      'app-header': AppHeader,
      'app-tab': Tab,
      About,
      AlertPanel,
      AppAsideNav,
      BaseLightBox,
      FollowingListInTab,
      MemberAccountEditor,
      MembersPanel,
      PostList,
      PostListDetailed,
      PostListInTab,
      PostPanel,
      TagList,
      TheControlBar,
      VideoList,
    },
    data () {
      return {
        activePanel: 'accounts',
        activeTab: 'reviews',
        alertType: 'post',
        config: {
          type: POST_TYPE,
        },
        currPage: DEFAULT_PAGE,
        currPagePostsDraft: DEFAULT_PAGE,
        currSort: DEFAULT_SORT,
        followingResource: 'member',
        isPublishPostInEditor: false,
        itemsActive: undefined,
        itemsSelected: [],
        loading: false,
        needConfirm: false,
        post: {},
        postActiveChanged: false,
        postForPublishInEditor: {},
        postPanel: 'add',
        postType: POST_TYPE.REVIEW,
        postsSelected: [],
        showAlert: false,
        showDraftList: false,
        showEditor: false,
        showLightBox: false,
        tabs: [
          this.$t('tab.WORDING_TAB_REVIEW_RECORD'),
          this.$t('tab.WORDING_TAB_NEWS_RECORD'),
          this.$t('tab.WORDING_TAB_FOLLOW_RECORD'),
        ],
      }
    },
    computed: {
      followingByUser () {
        return _.get(this.$store, [ 'state', 'followingByUser', ], [])
      },
      itemsSelectedID () {
        const items = []
        _.forEach(this.itemsSelected, (item) => {
          items.push(item.id)
        })
        return items
      },
      posts () {
        return _.get(this.$store, [ 'state', 'posts', ], [])
      },
      postsDraft () {
        return _.get(this.$store, [ 'state', 'postsDraft', ], [])
      },
      profile () {
        return _.get(this.$store, [ 'state', 'profile', ], {})
      },
      sections () {
        return SECTIONS_DEFAULT
      },
      tags () {
        return _.get(this.$store, [ 'state', 'tags', ], [])
      },
    },
    beforeMount () {
      this.loading = true
      this.$can('memberManage') && Promise.all([
        getMembers(this.$store, {}),
      ])
      .then(() => this.loading = false)
      .catch(() => this.loading = false)
    },
    methods: {
      addMember () {
        this.showLightBox = true
      },
      addPost (params) {
        this.itemsSelected = []
        this.itemsSelected.push(params)
        if (params.active === POST_ACTIVE.ACTIVE) {
          this.postForPublishInEditor = params
          this.isPublishPostInEditor = true
          this.itemsActive = params.active
          this.postActiveChanged = true
          this.needConfirm = true
          this.showAlert = true
        } else {
          addPost(this.$store, params)
            .then(() => {
              this.updatePostList({ needUpdateCount: true, })
              this.showEditor = false
              this.itemsActive = params.active
              this.postActiveChanged = true
              this.needConfirm = false
              this.showAlert = true
            })
        }
      },
      addTag (tagName) {
        this.itemsActive = TAG_ACTIVE.ACTIVE
        this.needConfirm = false
        this.loading = true
        addTags(this.$store, tagName)
        .then(() => {
          this.updateTagList({ needUpdateCount: true, })
          this.showAlert = true
        })
        .catch(() => this.loading = false)
      },
      alertHandler (showAlert) {
        this.showAlert = showAlert
      },
      deletePost () {
        this.itemsActive = POST_ACTIVE.DEACTIVE
        this.postActiveChanged = true
        this.needConfirm = true
        this.showAlert = true
      },
      deletePosts () {
        deletePosts(this.$store, {
          params: {
            ids: this.itemsSelectedID,
            updated_by: _.get(this.$store.state, [ 'profile', 'id', ]),
          },
        }).then(() => {
          this.updatePostList({ needUpdateCount: true, })
          this.showEditor = false
          this.showDraftList = false
          this.needConfirm = false
        })
      },
      deleteTags () {
        deleteTags(this.$store, this.itemsSelectedID)
          .then(() => {
            this.updateTagList({ needUpdateCount: true, })
            this.needConfirm = false
          })
      },
      filterChanged (filter = {}) {
        this.currPage = filter.page || this.currPage
        this.currSort = filter.sort || this.currSort
        
        switch (this.activePanel) {
          case 'accounts':
            return getMembers(this.$store, { page: this.currPage, sort: this.currSort, })
          case 'records':
          case 'posts':
          case 'videos':
            return this.updatePostList({ page: this.currPage, sort: this.currSort, })
          case 'tags':
            return this.updateTagList({ page: this.currPage, sort: this.currSort, })
          
        }
      },
      openPanel (panel) {
        this.loading = true
        this.activePanel = panel
        this.currSort = DEFAULT_SORT
        this.currPage = DEFAULT_PAGE
        switch (this.activePanel) {
          case 'records':
            this.alertType = 'post'
            Promise.all([
              getPostsByUser(this.$store, {
                where: { author: _.get(this.profile, [ 'id', ]), type: POST_TYPE.REVIEW, },
              }),
              getPostsCount(this.$store, {
                where: { author: _.get(this.profile, [ 'id', ]), type: POST_TYPE.REVIEW, },
              }),
            ])
            .then(() => this.loading = false)
            .catch(() => this.loading = false)
            break
          case 'posts':
            this.alertType = 'post'
            Promise.all([
              getPosts(this.$store, {
                where: { active: [ POST_ACTIVE.ACTIVE, POST_ACTIVE.PENDING, ], type: [ POST_TYPE.REVIEW, POST_TYPE.NEWS, ], },
              }),
              getPostsCount(this.$store, {
                where: { active: [ POST_ACTIVE.ACTIVE, POST_ACTIVE.PENDING, ], type: [ POST_TYPE.REVIEW, POST_TYPE.NEWS, ], },
              }),
            ])
            .then(() => this.loading = false)
            .catch(() => this.loading = false)
            break
          case 'tags':
            this.alertType = 'tag'
            Promise.all([
              getTags(this.$store, { stats: true, }),
              getTagsCount(this.$store),
            ])
            .then(() => this.loading = false)
            .catch(() => this.loading = false)
            break
          case 'videos':
            this.alertType = 'video'
            Promise.all([
              getPosts(this.$store, {
                where: { type: POST_TYPE.VIDEO, },
              }),
              getPostsCount(this.$store, {
                where: { type: POST_TYPE.VIDEO, },
              }),
            ])
            .then(() => this.loading = false)
            .catch(() => this.loading = false)
            break
        }
      },
      publishPost (params) {
        this.postForPublishInEditor = params
        this.isPublishPostInEditor = true
        this.itemsActive = params.active
        this.postActiveChanged = true
        this.needConfirm = true
        this.showAlert = true
      },
      publishPostHandler () {
        if (this.isPublishPostInEditor) {
          if (this.postPanel === 'add') {
            addPost(this.$store, this.postForPublishInEditor)
              .then(() => {
                this.updatePostList({ needUpdateCount: true, })
                this.showEditor = false
                this.needConfirm = false
              })
          } else {
            updatePost(this.$store, this.postForPublishInEditor)
              .then(() => {
                this.updatePostList({ needUpdateCount: false, })
                this.showEditor = false
                this.showDraftList = false
                this.needConfirm = false
              })
          }
        } else {
          const params = {}
          params.updated_by = _.get(this.$store.state, [ 'profile', 'id', ])
          params.ids = this.itemsSelectedID
          publishPosts(this.$store, params)
            .then(() => {
              this.updatePostList({ needUpdateCount: true, })
              this.needConfirm = false
            })
        }
      },
      showAlertHandler (ids, itemsActive) {
        this.itemsSelected = []
        switch (this.alertType) {
          case 'post':
          case 'video':
            this.postActiveChanged = true
            this.isPublishPostInEditor = false
            this.itemsActive = itemsActive
            this.itemsSelected = _.filter(this.posts, (o) => {
              return _.includes(ids, o.id)
            })
            break
          case 'tag':
            this.itemsActive = TAG_ACTIVE.DEACTIVE
            this.itemsSelected = _.filter(this.tags, (o) => {
              return _.includes(ids, o.id)
            })
            break
        }
        this.needConfirm = true
        this.showAlert = true
      },
      showDraftListHandler (type) {
        this.loading = true
        switch (type) {
          case POST_TYPE.REVIEW:
            Promise.all([
              getPostsByUser(this.$store, {
                where: {
                  author: _.get(this.profile, [ 'id', ]),
                  active: POST_ACTIVE.DRAFT,
                  type: POST_TYPE.REVIEW,
                },
              }),
              getPostsCount(this.$store, {
                where: {
                  author: _.get(this.profile, [ 'id', ]),
                  active: POST_ACTIVE.DRAFT,
                  type: POST_TYPE.REVIEW,
                },
              }),
            ])
            .then(() => {
              this.loading = false
              this.showDraftList = true
            })
            .catch(() => this.loading = false)
            break
          case POST_TYPE.NEWS:
            Promise.all([
              getPostsByUser(this.$store, {
                where: {
                  author: _.get(this.profile, [ 'id', ]),
                  active: POST_ACTIVE.DRAFT,
                  type: POST_TYPE.NEWS,
                },
              }),
              getPostsCount(this.$store, {
                where: {
                  author: _.get(this.profile, [ 'id', ]),
                  active: POST_ACTIVE.DRAFT,
                  type: POST_TYPE.NEWS,
                },
              }),
            ])
            .then(() => {
              this.loading = false
              this.showDraftList = true
            })
            .catch(() => this.loading = false)
            break
        }
      },
      showEditorHandler ({ postPanel, id, postType, }) {
        this.itemsSelected = []
        this.alertType = 'post'

        if (this.activePanel === 'videos') {
          this.alertType = 'video'
        }

        if (postPanel === 'add') {
          this.post = {}
          this.postType = postType
        } else {
          this.post = _.find(this.posts, { 'id': id, }) || _.find(this.postsDraft, { 'id': id, })
          this.postType = _.get(this.post, [ 'type', ])
          this.itemsSelected.push(this.post)
        }
        this.postPanel = postPanel
        this.showEditor = true
      },
      tabHandler (tab) {
        this.loading = true
        switch (tab) {
          case 0:
            this.activeTab = 'reviews'
            Promise.all([
              getPostsByUser(this.$store, {
                where: { author: _.get(this.profile, [ 'id', ]), type: POST_TYPE.REVIEW, },
              }),
              getPostsCount(this.$store, {
                where: { author: _.get(this.profile, [ 'id', ]), type: POST_TYPE.REVIEW, },
              }),
            ])
            .then(() => this.loading = false)
            .catch(() => this.loading = false)
            break
          case 1:
            this.activeTab = 'news'
            Promise.all([
              getPostsByUser(this.$store, {
                where: { author: _.get(this.profile, [ 'id', ]), type: POST_TYPE.NEWS, },
              }),
              getPostsCount(this.$store, {
                where: { author: _.get(this.profile, [ 'id', ]), type: POST_TYPE.NEWS, },
              }),
            ])
            .then(() => this.loading = false)
            .catch(() => this.loading = false)
            break
          case 2:
            this.activeTab = 'followings'
            getFollowing(this.$store, { subject: _.get(this.profile, [ 'id', ]), resource: 'member', })
              .then(() => this.loading = false)
              .catch(() => this.loading = false)
              break
        }
      },
      unfollow (resource, object) {
        const subject = _.get(this.profile, [ 'id', ]) 
        const objectID = object.toString()
        unfollow(this.$store, resource, subject, objectID) 
        .then(() => {
          setTimeout(() => this.updateFollowingList(), 1000)
        }) 
      },
      updateFollowingList (resource = this.followingResource) {
        this.followingResource = resource
        this.page = DEFAULT_PAGE
        switch (resource) {
          case 'review':
            return getFollowing(this.$store, { subject: _.get(this.profile, [ 'id', ]), resource: 'post', resourceType: resource, })
          case 'news':
            return getFollowing(this.$store, { subject: _.get(this.profile, [ 'id', ]), resource: 'post', resourceType: resource, })
          default:
            getFollowing(this.$store, { subject: _.get(this.profile, [ 'id', ]), resource: resource, })
        }
      },
      updatePost(params, activeChanged) {
        this.itemsActive = params.active
        this.postActiveChanged = activeChanged
        updatePost(this.$store, params)
          .then(() => {
            this.updatePostList({})
            this.showEditor = false
            this.showDraftList = false
            this.showAlert = true
            this.needConfirm = false
          })
          .catch((err) => console.error(err))
      },
      updatePostList ({ sort, page, needUpdateCount = false, }) {
        this.sort = sort || this.sort
        this.page = page || this.sort
        switch (this.activePanel) {
          case 'records':
            switch (this.activeTab) {
              case 'reviews':
                if (needUpdateCount) {
                  getPostsCount(this.$store, {
                    where: { author: _.get(this.profile, [ 'id', ]), type: POST_TYPE.REVIEW, },
                  })
                }
                getPostsByUser(this.$store, {
                  page: this.page,
                  where: { author: _.get(this.profile, [ 'id', ]), type: POST_TYPE.REVIEW, },
                })
                break
              case 'news':
                if (needUpdateCount) {
                  getPostsCount(this.$store, {
                    where: { author: _.get(this.profile, [ 'id', ]), type: POST_TYPE.NEWS, },
                  })
                }
                getPostsByUser(this.$store, {
                  page: this.page,
                  where: { author: _.get(this.profile, [ 'id', ]), type: POST_TYPE.NEWS, },
                })
                break
            }
            break
          case 'posts':
            if (needUpdateCount) {
              getPostsCount(this.$store, {
                where: { active: [ POST_ACTIVE.ACTIVE, POST_ACTIVE.PENDING, ], type: [ POST_TYPE.REVIEW, POST_TYPE.NEWS, ], },
              })
            }
            getPosts(this.$store, {
              page: this.page,
              sort: this.sort,
              where: { active: [ POST_ACTIVE.ACTIVE, POST_ACTIVE.PENDING, ], type: [ POST_TYPE.REVIEW, POST_TYPE.NEWS, ], },
            })
            .then(() => this.loading = false)
            .catch(() => this.loading = false)
            break
          case 'videos':
            if (needUpdateCount) {
              getPostsCount(this.$store, {
                where: { type: POST_TYPE.VIDEO, },
              })
            }
            getPosts(this.$store, {
              page: this.page,
              sort: this.sort,
              where: { type: POST_TYPE.VIDEO, },
            })
            .then(() => this.loading = false)
            .catch(() => this.loading = false)
            break
        }
      },
      updateTagList ({ sort, page, needUpdateCount = false, }) {
        this.sort = sort || this.sort
        this.page = page || this.sort
        if (needUpdateCount) {
          getTagsCount(this.$store)
        }
        getTags(this.$store, {
          page: this.page,
          sort: this.sort,
          stats: true,
        })
        .then(() => this.loading = false)
        .catch(() => this.loading = false)
      },
    },
    
  }
</script>
<style lang="stylus" scoped>
  .admin
    background-color #e6e6e6
    width 100%
    min-height 100vh
    &__container
      max-width 1200px
      margin auto
      padding 25px 0
      display flex
    &__aside
      width 75px
      height 100%
      position sticky
      // position fixed
      top 60px
    &__main
      margin-left 93.5px
    .control-bar
      width 100%
      margin 0 auto
    .panel
      width 100%
      padding 22px 84px 33px
      border 5px solid #d8ca21
      margin 0 auto
      background-color white
  @media (min-width 950px)
    .admin
      .control-bar
        max-width 950px
      .panel
        max-width 950px
</style>