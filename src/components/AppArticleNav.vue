<template>
  <div class="article-nav">
    <nav class="article-nav__nav-btns">
      <span class="comment-icon" @click="renderComment(`.article-nav__comment > .comment.comment-${postId}`)">
        <img class="comment-icon__thumbnail" src="/public/icons/comment-blue.png" alt="comment">
        <CommentCount class="comment-icon__count" :commentAmount="commentCount" :postId="postId" :type="'publicPostsHot'"></CommentCount>
      </span>
      <img class="follow-icon" :src="isFollow ? '/public/icons/star-blue.png' : '/public/icons/star-line-blue.png'" alt="follow" @click="toogleFollow">
    </nav>
    <div :class="`article-nav__comment`">
      <div :class="`comment comment-${postId}`"></div>
    </div>
  </div>
</template>

<script>
import { SITE_DOMAIN_DEV, } from 'src/constants'
import { renderComment, } from 'src/util/talk'
import _ from 'lodash'
import CommentCount from 'src/components/comment/CommentCount.vue'

const publishAction = (store, data) => {
  return store.dispatch('PUBLISH_ACTION', {
    params: data,
  })
}
const updateStoreFollowingByResource = (store, { action, resource, resourceId, userId, }) => {
  return store.dispatch('UPDATE_FOLLOWING_BY_RESOURCE', {
    params: {
      action: action,
      resource: resource,
      resourceId: resourceId,
      userId: userId,
    },
  })
}

export default {
  props: {
    articleType: {
      type: String,
      default: 'post',
    },
    postId: {
      // type: [ String, Number ],
      required: true,
    },
    commentCount: {
      type: Number,
      required: true,
    },
  },
  components: {
    CommentCount,
  },
  computed: {
    isFollow () {
      return this.$store.state.isLoggedIn && this.postFollowers.indexOf(this.$store.state.profile.id) !== -1
    },
    postFollowers () {
      if (this.$store.state.isLoggedIn) {
        const postFollowersData = _.find(this.$store.state.followingByResource[this.articleType], { resourceid: `${this.postId}`, })
        return postFollowersData ? postFollowersData.follower : []
      } else {
        return []
      }
    },
  },
  methods: {
    renderComment (ref) {
      renderComment(this.$el, `${ref}`, `${location.protocol}//${SITE_DOMAIN_DEV}/post/${this.postId}`)
    },
    toogleFollow () {
      if (!this.$store.state.isLoggedIn) {
        alert('please login first')
      } else {
        if (!this.isFollow) {
          publishAction(this.$store, {
            action: 'follow',
            resource: this.articleType,
            subject: this.$store.state.profile.id,
            object: `${this.postId}`,
          })
          updateStoreFollowingByResource(this.$store, {
            action: 'follow',
            resource: this.articleType,
            resourceId: this.postId,
            userId: this.$store.state.profile.id,
          })
        } else {
          publishAction(this.$store, {
            action: 'unfollow',
            resource: this.articleType,
            subject: this.$store.state.profile.id,
            object: `${this.postId}`,
          })
          updateStoreFollowingByResource(this.$store, {
            action: 'unfollow',
            resource: this.articleType,
            resourceId: this.postId,
            userId: this.$store.state.profile.id,
          })
        }
      }
    },
  },
}
</script>


<style lang="stylus" scoped>
.article-nav
  display flex
  flex-direction column
  &__nav-btns
    height 20px
    margin-top auto // for automatically placing nav to the botom of the container

$icon-size
  width 20px
  height 20px
.comment-icon
  cursor pointer
  &__thumbnail
    @extends $icon-size
  &__count
    position relative
    top 2px
    right 3px
    font-size 11px
    color #11b8c9
.follow-icon
  @extends $icon-size
  margin-left 4.5px
  cursor pointer
.donate-icon
  width 20px
  height 25px
  margin-left 16.2px
  cursor pointer
</style>

