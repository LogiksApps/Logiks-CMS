var currentSRC=null;

$(function() {
	$('#componentTree').delegate(".list-group-item.list-file a","click",function() {
		$('#componentTree .list-group-item.active').removeClass('active');
		tag=$(this).closest(".list-group-item");
		tag.addClass('active');

		path=tag.data('path');
		title=$(this).text();
		loadConfig(path, title);
	});

	$("#pgcontent").delegate("form input[name]","blur",function() {
		saveConfig(this);
	});

	loadList();
});

function pgPurge() {
	processAJAXQuery(_service("cleaner","PURGE:CONFIGS"),function(data) {
		if(data.Data=="done") {
			lgksToast("All configuration cache cleared.");
		} else {
			lgksToast(data.Data);
		}
	},"json");
}
function pgRefresh() {
	//window.document.location.reload();
	loadList();
}

function loadList() {
	$("#componentTree").html("<div class='ajaxloading ajaxloading5'></div>");
	$("#pgcontent").html("<h2 align=center>Please load a configuration.</h2>");

	processAJAXQuery(_service("settings","getlist")+"&srctype="+cfgSrcType,function(data) {
		$("#componentTree").html("");
		$.each(data.Data,function(k,v) {
			html="<div class='list-group-item list-file' data-path='"+v.path+"'><a href='#'><i class='glyphicon glyphicon-cog'></i>"+v.name+"</a></div>";
			$("#componentTree").append(html);
			
			if(cfgSrcTypeValue!=null && cfgSrcTypeValue.length>0) {
			    if($("#componentTree .list-group-item.list-file[data-path='"+cfgSrcTypeValue+"']").length>0) {
                	$("#componentTree .list-group-item.list-file[data-path='"+cfgSrcTypeValue+"'] a").click();
                }
			}
		});
	},"json");
}
function loadConfig(src, title) {
	currentSRC=src;
	$("#pgcontent").html("<div class='ajaxloading ajaxloading5'></div>");
	$("#pgcontent").load(_service("settings","fetch","html")+"&srctype="+cfgSrcType+"&src="+currentSRC,function() {
		$("input[type='checkbox'].switch").bootstrapSwitch();

		$("input[type='checkbox'].switch").on('switchChange.bootstrapSwitch', function(event, state) {
				nm=$(this).attr("name");
				saveConfig(this);
			});
	});

	if($('#componentTree .list-group-item.active').length>0) {
		$("#pgtoolbar .onsidebarActive").show();
	} else {
		$("#pgtoolbar .onsidebarActive").hide();
	}
}
function saveConfig(ele) {
	name=$(ele).attr("name");
	oldvalue=$(ele).data("oldvalue");
	
	if($(ele).hasClass("switch") || $(ele).attr("type")=="checkbox") {
		value=(ele.checked)?"true":"false";
	} else {
		value=$(ele).val();
	}
	if(value!=oldvalue) {
		lx=_service("settings","save","html")+"&srctype="+cfgSrcType+"&src="+currentSRC;

		processAJAXPostQuery(lx,encodeURIComponent(name)+"="+encodeURIComponent(value),function(txt) {
			if(txt!="success") {
				lgksToast(txt);
			} else {
				if($(ele).hasClass("switch") || $(ele).attr("type")=="checkbox") {
					value=(ele.checked)?"true":"false";
				} else {
					value=$(ele).val();
				}
				$(ele).data("oldvalue",value);

				lgksToast("SAVE SUCCESSFULL");
			}
		});
	}
}
