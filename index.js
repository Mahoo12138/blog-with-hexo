const Hexo = require('hexo');


let __SECRET_HEXO_INSTANCE__ = null;

const initHexo = async () => {
  if (__SECRET_HEXO_INSTANCE__) {
    return __SECRET_HEXO_INSTANCE__;
  }
  const hexo = new Hexo(process.cwd(), {
    debug: true,
  });

  __SECRET_HEXO_INSTANCE__ = hexo;

  globalThis.hexo = hexo;

  hexo.on('processAfter', function (path) {
    console.log('Loaded file:', path);
  });

  await hexo.init();
  await hexo.load();

  // if (hexo.env.init && hexo._dbLoaded) {
  //   await hexo.database.save();
  // }

  return hexo;
};

initHexo().then((hexo) => {
  console.log('hexo', hexo.source);
  console.log(hexo.config);
  const posts = hexo.database.model('Post').find({}).toArray();
  console.log('posts', posts);
  return hexo;
});


