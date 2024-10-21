const pagination = require('hexo-pagination');

function posts_generator(locals) {
  const config = this.config;
  const posts = locals.posts.sort(config.posts_generator.order_by);

  posts.data.sort((a, b) => (b.sticky || 0) - (a.sticky || 0));

  const path = config.posts_generator.path || 'posts';

  const text =  pagination(path, posts, {
    perPage: config.posts_generator.per_page,
    layout: config.posts_generator.layout || ['posts'],
    format: '%d/',
    data: {
      __posts: true
    }
  });
  console.log("post", text);
  return text
};


hexo.config.posts_generator = Object.assign({
  per_page: typeof hexo.config.per_page === 'undefined' ? 10 : hexo.config.per_page,
  order_by: '-date',
  layout: ['posts']
}, hexo.config.posts_generator);

console.log('posts_generator', hexo.config.posts_generator);
hexo.extend.generator.register('posts', posts_generator);