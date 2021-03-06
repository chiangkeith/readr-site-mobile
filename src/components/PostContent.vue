<template>
  <div class="post-content">
    <h1 class="post-content__title" v-text="post.title"></h1>
    <div class="editor-writing">
      <div class="editor-writing__container">
        <template v-for="(p, i) in postContent">
          <p class="editor-writing__paragraph--visible" v-if="i === 0">
            <span v-html="firstParagraph"></span>
            <span v-if="(p.length > 150 || postContent.length > 1) ? !isReadMore : false">
              ......<span class="editor-writing__more" @click="toogleReadmore" v-text="$t('homepage.WORDING_HOME_POST_MORE')"></span>
            </span>
          </p>
          <p :class="`editor-writing__paragraph--${isReadMore ? 'visible' : 'invisible'}`" v-else v-html="p"></p>
        </template>
      </div>
    </div>
    <a class="editor-writing-source" v-if="hasSource" :href="post.link" target="_blank">
      <div class="editor-writing-source__content">
        <h1 class="editor-writing-source__title" v-text="linkTitleTrim"></h1>
        <div class="editor-writing-source__description">
          <p class="editor-writing-source__cite" v-if="post.linkName">{{ $t('homepage.WORDING_HOME_POST_SOURCE') }}{{ post.linkName }}</p>
        </div>
      </div>
      <img class="editor-writing-source__figure" :src="post.linkImage" alt="source-fig">
    </a>
    <!-- <AppArticleNav :postId="this.post.id" :commentCount="commentCount"></AppArticleNav> -->
  </div>
</template>
<script>
  import { find, get, map, } from 'lodash'
  import AppArticleNav from 'src/components/AppArticleNav.vue'
  import sanitizeHtml from 'sanitize-html'
  import truncate from 'truncate'

  const dom = require('xmldom').DOMParser
  const seializer  = require('xmldom').XMLSerializer
  // const debug = require('debug')('CLIENT:PostContent')
  export default {
    name: 'PostContent',
    computed: {
      commentCount () {
        return get(find(get(this.$store, 'state.commentCount'), { postId: this.post.id, }), 'count', 0)
      },
      firstParagraph () {
        const limit = 150
        if (!this.postContent[0]) return ''
        return !this.isReadMore ? this.postContent[0].slice(0, limit) : this.postContent[0]
      },
      hasSource () {
        return this.post.linkTitle && this.post.linkDescription
      },
      linkTitleTrim () {
        return truncate(this.post.linkTitle, 20)
      },
      linkDescriptionTrim () {
        return truncate(this.post.linkDescription, 45)
      },
      postContent () {
        if (!this.post.content || this.post.content.length === 0) { return }
        const wrappedContent = sanitizeHtml(this.post.content, { allowedTags: false, selfClosing: [ 'img', ], })
        const doc = new dom().parseFromString(wrappedContent)
        const postParagraphs = map(get(doc, 'childNodes'), (p) => (sanitizeHtml(new seializer().serializeToString(p), { allowedTags: [ 'img', ], })))
        return postParagraphs
      },
    },
    components: {
      AppArticleNav,
    },
    data () {
      return {
        isReadMore: false,
      }
    },
    methods: {
      toogleReadmore () {
        this.isReadMore = true
      },
    },
    mounted () {},
    props: [ 'post', ],
  }
</script>
<style lang="stylus">
  .post-content
    &__title
      font-size 15px
      font-weight 600
      margin 0
  .editor-writing
    margin 10px 0
    &__container 
      // min-height 105px
      // overflow hidden
      // text-overflow: ellipsis;
      margin-bottom 15px
      & > p
        font-size 14px
        font-weight 300
        text-align justify
        line-height 1.4
        margin 0
        // text-overflow: ellipsis;
      p > br
        display none
      p > img, p img
        width 100%
        margin 20px 0
      p + p
        margin-top 6px
    &__more
      font-weight 500
      color #a7a7a7
      cursor pointer
      &:hover
        border-bottom 1px solid currentColor
    &__paragraph
      &--visible
        display block
      &--invisible
        display none

  .editor-writing-source
    height 102px
    border solid 0.5px #d3d3d3
    display flex
    justify-content space-between
    margin-bottom 7.5px
    &__content
      order 1
      width 50%
      padding 10px
      position relative
    &__title
      font-size 12px
      font-weight 500
      color #808080
      margin 0
    &__figure
      order 0
      margin 0
      display flex
      align-self center
      width 50%
      height 100%
      object-fit cover
      object-position center
    &__cite
      font-size 11px
      font-weight 300
      color #808080
      align-self flex-end
      
</style>