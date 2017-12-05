import { sharebigfilesController } from './controller';
import { upload } from './model';
import { ng, model } from 'entcore';
import http from 'axios';

ng.controllers.push(sharebigfilesController);

model.build = function(){
	this.makeModels(upload);

	this.collection(upload.Upload, {
		syncBigFiles:function(cb) {
			var that = this;
			http.get('/sharebigfiles/list').then(function (res) {
				if (res.data.length > 0)
					that.load(res.data, cb, null);
			})
		},
		behaviours: 'sharebigfiles'
	});
};