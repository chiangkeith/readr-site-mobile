<template>
  <section class="postListInTab">
    <PaginationNav v-if="parent !== 'RewardPointsInTab'" :totalPages="totalPages" @pageChanged="$_postListInTab_pageChanged"></PaginationNav>
    <div v-for="p in posts" :key="p.id" class="postListInTab__post">
      <div
        class="postListInTab__active"
        :class="[ $_shouldHighlightStatus(p) ? 'draft' : '' ]"
        v-text="$_postListInTab_getActive(p)">
      </div>
      <div class="postListInTab__content">
        <div class="postListInTab__title">
          <h2 v-text="p.title"></h2>
          <div v-if="!(!$can('editOtherPost') && p.active !== config.active.DRAFT) && parent !== 'RewardPointsInTab'" class="postListInTab__control--desktop">
            <button class="postListInTab__btn" @click="$_postListInTab_editPost(p.id)" v-text="$t('post_list.WORDING_POSTLIST_EDIT')"></button>
            <button class="postListInTab__btn" @click="$_postListInTab_deletePost(p.id)" v-text="$t('post_list.WORDING_POSTLIST_DELETE')"></button>
          </div>
        </div>
        <div v-if="parent === 'RewardPointsInTab'" class="postListInTab__descr">
          <p class="points-info">{{ $t('point.WORDING_POINTS_SPENT') }}： {{ p.points }} 點</p>
          <p class="points-info">{{ $t('point.WORDING_POINTS_SPENT_WHEN') }}： {{ p.createdAt.replace(/-/g, '/').replace('T', ' ').replace('Z', '') }}</p>
        </div>
        <p v-else-if="p.content" class="postListInTab__descr" v-text="$_postListInTab_getDescr(p.content)"></p>
      </div>
      <div class="postListInTab__control--mobile">
        <button class="postListInTab__btn" @click="$_postListInTab_editPost(p.id)" v-text="$t('post_list.WORDING_POSTLIST_EDIT')"></button>
        <button class="postListInTab__btn" @click="$_postListInTab_deletePost(p.id)" v-text="$t('post_list.WORDING_POSTLIST_DELETE')"></button>
      </div>
    </div>
  </section>
</template>
<script>
  import { POST_ACTIVE, } from '../../api/config'
  import _ from 'lodash'
  import PaginationNav from './PaginationNav.vue'

  const MAXRESULT = 20

  export default {
    name: 'PostListInTab',
    components: {
      PaginationNav,
    },
    props: {
      parent: {
        type: String,
      },
      posts: {
        type: Array,
        default: [],
        // required: true
      },
    },
    data () {
      return {
        config: {
          active: POST_ACTIVE,
        },
        postConfig: POST_ACTIVE,
      }
    },
    computed: {
      totalPages () {
        return Math.ceil(_.get(this.$store, [ 'state', 'postsCount', ], 0) / MAXRESULT)
      },
    },
    methods: {
      $_postListInTab_deletePost (id) {
        this.$emit('deletePost', [ id, ], POST_ACTIVE.DEACTIVE)
      },
      $_postListInTab_editPost (id) {
        this.$emit('editPost', { postPanel: 'edit', id: id, })
      },
      $_postListInTab_getActive (post) {
        switch (post.active) {
          case POST_ACTIVE.ACTIVE:
            return this.parent !== 'RewardPointsInTab' ? this.$t('post_list.WORDING_POSTLIST_ACTIVE_PUBLISH') : this.$t('post_list.WORDING_POSTLIST_ACTIVE_PUBLISH_PROJECT')
          case POST_ACTIVE.DRAFT:
            return this.$t('post_list.WORDING_POSTLIST_ACTIVE_DRAFT')
          case POST_ACTIVE.PENDING:
            return this.parent !== 'RewardPointsInTab' ? this.$t('post_list.WORDING_POSTLIST_ACTIVE_PENDING') : this.$t('post_list.WORDING_POSTLIST_ACTIVE_PENDING_PROJECT')
          case POST_ACTIVE.UNPUBLISH:
            return this.$t('post_list.WORDING_POSTLIST_ACTIVE_UNPUBLISH')
          default:
            return this.$t('post_list.WORDING_POSTLIST_ACTIVE_DRAFT')
        }
      },
      $_postListInTab_getDescr (content) {
        const parser = new DOMParser()
        const html = parser.parseFromString(content, 'text/html')
        const origin = Array.from(html.querySelectorAll('p'))
          .filter((node) => {
            return node.innerHTML !== '<br>'
          })
          .map((node) => {
            return node.innerHTML.replace(/<[^>]*>/g, "")
          })
          .join('')
        return origin
      },
      $_postListInTab_pageChanged (index) {
        this.$emit('filterChanged', { page: index, })
      },
      $_shouldHighlightStatus (post) {
        return post.active === this.config.active.DRAFT || (this.parent === 'RewardPointsInTab' && post.active === this.config.active.ACTIVE)
      },
    },
  }
</script>
<style lang="stylus" scoped>
.postListInTab
  width 100%
  margin 0 auto
  &__post
    display flex
    flex-direction column
    padding 0 0 10px
    border-bottom 1px solid #979797
    h2
      margin 0
    &:not(:first-of-type)
      margin-top 10px
    &:last-of-type
      border-bottom none
  &__active
    width 55px
    height 25px
    color #ddcf21
    font-size 14px
    text-align center
    line-height 25px
    background-color #444746
    &.draft
      color #444746
      background-color #ddcf21
  &__content
    flex 1
    margin 10px 0 0
  &__title
    display flex
    justify-content space-between
    h2
      max-width 100%
      font-size 15px
      white-space nowrap
      text-overflow ellipsis
      overflow hidden
  &__control
    &--mobile
      display flex
      justify-content space-between
      margin-top 5px
    
  &__btn
    width calc((100% - 25px) / 2)
    height 25px
    color #fff
    background-color #4280a2
    border none
  &__descr
    max-height 59px
    margin 5px 0 0
    font-size 14px
    font-weight 300
    text-align justify
    line-height 1.4
    overflow hidden

.points-info
  margin 0
 
</style>
