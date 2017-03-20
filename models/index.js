var Sequelize = require('sequelize');
var db = new Sequelize('postgres://localhost:5432/wikiprestudy', {
	logging: false
});
var marked = require('marked');

// http://docs.sequelizejs.com/en/v3/docs/models-definition/#data-types
const Page = db.define('page', {
	title: {
		type: Sequelize.STRING  ,
		allowNull: false,
	},
	urlTitle: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	content: {
		type: Sequelize.TEXT,
		allowNull: false	
	},
	status: {
		type: Sequelize.ENUM('open', 'closed'),
		defaultValue: 'open'
	},
    date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
     tags: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        set: function (value) {

            var arrayOfTags;

            if (typeof value === 'string') {
                arrayOfTags = value.split(',').map(function (s) {
                    return s.trim();
                });
                this.setDataValue('tags', arrayOfTags);
            } else {
                this.setDataValue('tags', value);
            }

        }
    }
}, {
	hooks: {
	    beforeValidate: function(page) {
	    if (page.title) {
		    page.urlTitle = page.title.replace(/\s+/g, '_').replace(/\W/g, '');
		  } else {
		    page.urlTitle =  Math.random().toString(36).substring(2, 7);
		  }
	  }
    },
	getterMethods: {
    	route: function()  { return '/wiki/' + this.urlTitle; },
    	renderedContent: function() {
    		return marked(this.content);
    	}
  	},
  	// setterMethods: {
  	// 	tagsSet: function(value){
  	// 		 if (typeof value === 'string') {
   //              arrayOfTags = value.split(',').map(function (s) {
   //                  return s.trim();
   //              });
   //              this.tags =  arrayOfTags;
   //          } else {
   //              this.tags =  value;
   //          }
  	// 	}
  	// },
  	classMethods: {
  		findByTag: function(tag) {
  			return Page.findAll({
			    // $overlap matches a set of possibilities
			    where : {
			        tags: {
			            $overlap: [tag]
			        }
			    }    
			});
  		}
  	},
  	instanceMethods: {
  		findSimilar: function(){
  			return Page.findAll({
			    // $overlap matches a set of possibilities
			    where : {
			        tags: {
			            $overlap: this.tags
			        },
			        id: {
                        $ne: this.id
                    } 
			    }
			       
			});	
  		}
  	}
});

const User = db.define('user', {
	name: {
		type: Sequelize.STRING  ,
		allowNull: false,
	},
	email: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
            isEmail: true
        }
	}
});

Page.belongsTo(User, { as: 'author' });

module.exports = { db, Page, User};

