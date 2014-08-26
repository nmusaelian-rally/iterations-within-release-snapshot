Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    items:{ html:'<a href="https://help.rallydev.com/apps/2.0rc3/doc/">App SDK 2.0rc3 Docs</a>'},
    launch: function() {
        var rComboBox = Ext.create('Rally.ui.combobox.ReleaseComboBox',{
   		listeners:{
   			ready: function(combobox){
   				this._getIterations(combobox.getRecord());
   			},
   			select: function(combobox){
   				this._getIterations(combobox.getRecord());
   			},
   			scope: this 
   		}
   	});
   	this.add(rComboBox);
    },
    
     _getIterations: function(release){
        var project = this.getContext().getProject();
        var projectRef = project._ref;
        this._projectOid = project.ObjectID;
        console.log(project);
        var releaseStartDate = release.get('ReleaseStartDate');
        var releaseDate = release.get('ReleaseDate');
        var releaseStartDateISO = Rally.util.DateTime.toIsoString(releaseStartDate,true);
        var releaseDateISO = Rally.util.DateTime.toIsoString(releaseDate,true);
        console.log('loading iterations that fall within', releaseStartDateISO, ' and ', releaseDateISO);
        
   	var myStore = Ext.create('Rally.data.wsapi.Store',{
   		model: 'Iteration',
   		autoLoad:true,
   		fetch: ['Name','StartDate','EndDate','ObjectID', 'Theme'],
   		filters:[
   			{
   			    property : 'StartDate',
   			    operator : '>=',
   			    value : releaseStartDateISO
   			},
                        {
                            property : 'EndDate',
   			    operator : '<=',
   			    value : releaseDateISO
                        },
                        {
                            property : 'Project',
                            value: projectRef
                        }
   		],
   		listeners: {
   			load: function(store,records,success){
   				console.log("loaded %i records", records.length);
   				this._getVelocity(store,records);
   			},
   			scope:this
   		}
   	});
     },
     
     
    _getVelocity: function(store,iterations) {
        var that = this;
        var deferred = Ext.create('Deft.Deferred');
        _.each(iterations,function(iteration){
    
            var start_date_iso = Rally.util.DateTime.toIsoString(iteration.get('StartDate'),true);
            var end_date_iso = Rally.util.DateTime.toIsoString(iteration.get('EndDate'),true);
            
            var currentProjectOID = parseInt(that.getContext().getProjectRef().match(/\d+/), 10);
            Ext.create('Rally.data.lookback.SnapshotStore',{
                autoLoad: true,
                fetch: ['FormattedID','PlanEstimate','ScheduleState'],
                hydrate: ['ScheduleState'],
                filters: [
                    {
                        property: '_TypeHierarchy',
                        operator: 'in',
                        value: ['HierarchicalRequirement']
                    },
                    {
                        property: '_ProjectHierarchy',
                        value: currentProjectOID
                    },
                    {
                        property: '_ValidFrom',
                        operator: '>=',
                        value:start_date_iso
                    },
                    {
                        property: '_ValidFrom',
                        operator: '<=',
                        value:end_date_iso
                    }
                ],
                listeners: {
                    load: function(store, records) {
                        that._log(records) 
                    }
                }
            });
        }); 
    },
    _log:function(records){
        console.log('log', records);
    }
});
