Backbone.sync = function(method, model){
	// helper functions
	function syncCreateHandler(model){
		now.getUUID( function(uuid){
			model.id = uuid;
			model.set({id: uuid});
			syncUpdateHandler(model);
		});
	};

	function syncReadHandler(model){
		now.dbGet( model.id, function(){} );
	};

	function syncUpdateHandler(model){
		var modelJSON = model.toJSON();
		now.dbSet( modelJSON, function(){} );
	};

	function syncDeleteHandler(model){
		now.dbRM( model.id, function(){} );
	};

	// parse and execute request
	var methodMap = {
		create: syncCreateHandler,
		read: syncReadHandler,
		update: syncUpdateHandler,
		delete: syncDeleteHandler
	};
	methodMap[method](model);
};

var Renderable = Backbone.Model.extend({
	
});

var SuperView = Backbone.View.extend({	// a view that contains views
	//subViews: [view1, view2...]
	render: function(){
		_(this.subViews).each(function(aSubview){
			//(foreach) render subview
			aSubview.render();
			//(foreach) append subview
			$(this.el).append(aSubview.el);
		});
		return this;	//for possible call chaining
	}
});

var ArticleCollection = Backbone.Collection.extend({
	model: Renderable,
	initialize: function(){
		var theCollection = this;
		
		//populate data
		// get array of article UUIDs
		now.dbGet('articles', haveArticleUUIDsPromise);	
		
		function haveArticleUUIDsPromise(articleUUIDs){
			// add each article to the collection
			//for (var idx in articleUUIDs){
			//	theCollection.add({id: articleUUIDs[idx]});
			//}
			_(articleUUIDs).each( function(ele){theCollection.add({id: ele})} );	// might need to bind this to something else
			
			// update data in each Renderable in the collection
			theCollection.each( function(theModel){ theModel.fetch(); });
			//^ hmm... this is async... might not be the best idea...
			
			// show view
			theCollection.view = new SuperView({el: $('body')[0], collection: theCollection});	//unhardcode this later!
		}
	}
});
	
var MdConverter = new Showdown.converter();
var MarkdownView = Backbone.View.extend({
	tagName: 'article',
	render: function(){
		var markdownOutput = MdConverter.makeHtml( this.model.get('markdown') );
		$(this.el).html( markdownOutput );
		return this;	// for possible call chaining
	}
});