const routes_config = module.parent.parent.require('./config/routes');

exports.say_hello = () => {
  console.log(`Hello ${routes_config.my_name}!!`);
}
