var env = process.env.NODE_ENV || 'development';

if(env === 'development' || env === 'test'){
  //automatically turns into js object
  const config = require('./config.json');
  const envConfig = config[env];

  //loop over array to determine which key to use
  Object.keys(envConfig).forEach( (key) => {
    process.env[key] = envConfig[key];
  });
}
