# Sodiumdev Blog Engine:
In this project I implemented the following features:
- Database: [MongooseODM](https://mongoosejs.com).
- Authentication: Using [passport.js](http://www.passportjs.org/) local strategy and Mongodb as sessions store.
- Templating: [ejs](https://ejs.co)
- Live Markdown Editor: [EasyMDE](https://github.com/Ionaru/easy-markdown-editor)
- Responsive UI: [Bootstrap](https://getbootstrap.com/docs/4.0/getting-started/introduction/)

> Live Demo: [Sodiumdev](https://Sodiumdev.herokuapp.com)


## ENV Variables:
Name                            Describtion 
PORT                            Server listening port
SECRET                          
MONGO_URI                       Mongodb connection URI

SESSION_STORE_URI               Mongo URI for sessions data. MUST include DB name
SESSION_STORE_COLLECTION        Collection name

