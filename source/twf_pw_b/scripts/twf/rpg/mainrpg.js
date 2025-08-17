//  The World Foundry

/* Player abilities
	Special abilities
	Skills
	Treasure
	Custom equipment
	Teleportalwaystones
	Towers
	
*/


import * as mc from "@minecraft/server";
import * as mcui from "@minecraft/server-ui";
const DEBUG = true
const dimensions = [ mc.world.getDimension("overworld"), mc.world.getDimension("nether"), mc.world.getDimension("the_end") ];

const NAMESPACE = "twf_rpg:"
const NS = NAMESPACE
const GUIDE_BOOK_NAME = "Role Play Game Guide"
const PROPERTY_WIZ_BOOK_NAME = "Property Wizard"
const NOTIFY_KEY = NAMESPACE+"notify"
const MSG_PREFIX = "[Role Play Game]"

// abilities
const STAT_INT_KEY = NS+"intelligence"
const STAT_WIS_KEY = NS+"wisdom"
const STAT_STR_KEY = NS+"strength"
const STAT_DEX_KEY = NS+"dexterity"
const STAT_CON_KEY = NS+"constitution"
const STAT_CHA_KEY = NS+"charisma"
const STAT_LUC_KEY = NS+"luck"
const STAT_POINTS_KEY = NS+"stat_points"
const ABILITY_KEYS = [
	STAT_INT_KEY,
	STAT_WIS_KEY,
	STAT_STR_KEY,
	STAT_DEX_KEY,
	STAT_CON_KEY,
	STAT_CHA_KEY,
	STAT_LUC_KEY
]


// currency
const STAT_COIN_CP_KEY = NS+"coin_copper"
const STAT_COIN_IP_KEY = NS+"coin_iron"
const STAT_COIN_RP_KEY = NS+"coin_redstone"
const STAT_COIN_SP_KEY = NS+"coin_silver"
const STAT_COIN_GP_KEY = NS+"coin_gold"
const STAT_COIN_PP_KEY = NS+"coin_platinum"
const STAT_COIN_NP_KEY = NS+"coin_netherite"
const CURRENCY_KEYS = [
	STAT_COIN_CP_KEY,
	STAT_COIN_IP_KEY,
	STAT_COIN_RP_KEY,
	STAT_COIN_SP_KEY,
	STAT_COIN_GP_KEY,
	STAT_COIN_PP_KEY,
	STAT_COIN_NP_KEY
]

function new_action_form(identifier) {
	let this_form = new mcui.ActionFormData();
	this_form.title({rawtext: [{translate: NS+"guide."+identifier+".title",with: ["\n"]}]});
	this_form.body({rawtext: [{translate: NS+"guide."+identifier+".body",with: ["\n"]}]});
	return this_form;
}


function random_integer(min, max) {
	let val = Math.floor(Math.random()*(max-min));
	return min+val;
}

function roll_dice(dice_size, dice_num) {
	let val = 0
	
	for(let i=0; i < dice_num; i++) {
		val += random_integer(1, dice_size) // 1d6
	}
	return val;
}


const excludeEntityTypes = [

]

function what_entity_am_i_looking_at(player, detail_distance) {
	let cast = undefined;
	let particle_loc = {x:undefined, y:undefined, z:undefined};

	let entityRayCastHit = player.getEntitiesFromViewDirection({
													maxDistance: detail_distance,
													excludeEntityTypes
												  });
	if (entityRayCastHit.length > 0) {
		return entityRayCastHit[0].entity;
	}
	return undefined;
}

function what_block_am_i_looking_at(player, detail_distance) {
	let cast = player.getBlockFromViewDirection( { maxDistance: detail_distance, includeLiquidBlocks: true });
	if(cast !== undefined){
		return cast.block;
	}
	return undefined;
}


function get_dynamic_property_with_default(player, key, def_val) {
	let prop = player.getDynamicProperty(key);
	if(prop == undefined) {
		prop = def_val;
		player.setDynamicProperty(key, prop);
	}
	return prop
}

function notify_player(player, msg) {
	let notify = get_dynamic_property_with_default(player, NOTIFY_KEY, true);
	if(notify) {
		player.sendMessage(MSG_PREFIX+String(msg));
	}
}

function give_spawn_item(player, itemTypeId, qty, name) {
	const initialised_on_spawn = name + ' init';
	if(player.getDynamicProperty(initialised_on_spawn) === undefined) {
		let item = new mc.ItemStack(itemTypeId, qty);
		item.nameTag = name;
		player.dimension.spawnItem(item, player.location);
		player.setDynamicProperty(initialised_on_spawn, true);
	};
};

function roll_abilities(player) {
	ABILITY_KEYS.forEach( function(ability, index) {
		get_dynamic_property_with_default(player, ability, roll_dice(6, 3)); // Initialise 3d6
	});	
}

mc.world.afterEvents.playerSpawn.subscribe(event => {
	const players = mc.world.getPlayers( { playerId: event.playerId } );
	for ( let player of players ) {
		get_dynamic_property_with_default(player, NOTIFY_KEY, true);

		give_spawn_item(player, "minecraft:book", 1, GUIDE_BOOK_NAME);
		give_spawn_item(player, "minecraft:book", 1, PROPERTY_WIZ_BOOK_NAME);
		
		if(!player.getDynamicProperty(NAMESPACE+"stats_init")) { // RPG Stats
			roll_abilities(player);
			get_dynamic_property_with_default(player, STAT_POINTS_KEY, 6); // Initialise 3d6
			player.setDynamicProperty(NAMESPACE+"stats_init", true)
		}
	}
});

mc.world.afterEvents.itemUse.subscribe(async (event) => {
    const { source: player, itemStack } = event;
        // YOUR CODE GOES HERE });
		if (itemStack.typeId.includes("book")) {
			if (itemStack.nameTag === GUIDE_BOOK_NAME) {
				guide_book_show(player);
			};
			if (itemStack.nameTag === PROPERTY_WIZ_BOOK_NAME) {
				property_wizard_book_show(player);
			};			
		} else if(itemStack.typeId.includes("scroll")) {
			// Scrolls either are cast on an entity that's being looked at or open a UI to manage the contents.
			
		};
    });

function guide_book_show(player) {
	let this_form = new_action_form("start");
    this_form.button({rawtext: [{translate: NS+"guide.start.stats",with: ["\n"]}]}) // Button 0
	this_form.button({rawtext: [{translate: NS+"guide.start.coins",with: ["\n"]}]}) // Button 0
	this_form.button({rawtext: [{translate: NS+"guide.start.button",with: ["\n"]}]}) // Button 1
	this_form.show(player).then((response) => {
		if(response.selection != undefined) {
			if(response.selection == 0) {
				statistics_editor_show(player);
			} else if(response.selection == 1) {
				coins_show(player);
			}
			
		}
	});
};

function coins_show(player) {
	let this_form = new_action_form("coins");;
	
	CURRENCY_KEYS.forEach( function(item, index) {
		this_form.button({rawtext: [{translate: NS+"guide.coins."+item.replace(NS,""),with: ["\n"]}]}, 
		"textures/twf/rpg/values/num"+String(get_dynamic_property_with_default(player, item, 0))) // Button
	});	
	this_form.button({rawtext: [{translate: NS+"guide.coins.button",with: ["\n"]}]}) // Button Back
	
	this_form.show(player).then((response) => {
		if(response.selection != undefined) {
			if(response.selection == 0) {
			}
		}
	});
	
	
}

function allocate_points_show(player) {
	let this_form = new_action_form("points");	
}

function statistics_editor_show(player) {
	let this_form = new_action_form("stats");
	this_form.button({rawtext: [{translate: NS+"guide.stats.points",with: ["\n"]}]}, "textures/twf/rpg/values/num"+String(player.getDynamicProperty(STAT_POINTS_KEY))) // Button 0
	ABILITY_KEYS.forEach( function(ability, index) {
		this_form.button({rawtext: [{translate: NS+"guide.stats."+ability.replace(NS,""),with: ["\n"]}]}, 
		"textures/twf/rpg/values/pie"+String(player.getDynamicProperty(ability))) // Button
	});
	this_form.button({rawtext: [{translate: NS+"guide.stats.button",with: ["\n"]}]}) // Button Back
	
	this_form.show(player).then((response) => {
		if(response.selection != undefined) {
			if(response.selection == 0) {
				// Allocate points
				allocate_points_show(player);
			}
		}
	});
	
	
}

/* Uncomment if regular polling is required
let iteration = 0;
function run_each_frame() {
    iteration++;
    if(iteration%20 == 0) { mc.world.sendMessage("twf_rpg "+String(iteration/20));	};
    for(let dimension of dimensions) {
        // YOUR CODE GOES HERE
    };
};

mc.system.runInterval(() => {
   try {
       run_each_frame();
   } catch(error) {
       if(DEBUG) mc.world.sendMessage("[twf_rpg] Error in mc.system.runInterval: "+String(error)+" "+String(error.stack));
   };
}, 1);
*/

// PROPERTY WIZARD

function property_wizard_book_show(player) {
	let this_form = new_action_form("pw.start");

	let show_detail = false;
	let detail_distance = get_dynamic_property_with_default(player, NAMESPACE+"detail_distance", 32);
	const button_callbacks = new Map();
	let found_entity = what_entity_am_i_looking_at(player, detail_distance);
	if(!found_entity) {
		found_entity = player;
	}
	let button_idx = 0;
	if(found_entity) {
		let display_text = "Entity ID §1"+found_entity.typeId;
		this_form.button(display_text);
		button_idx++;
		this_form.button({rawtext: [{translate: NS+"guide.pw.start.property_add",with: ["\n"]}]});
		button_idx++;
		let properties = found_entity.getDynamicPropertyIds();
		if(properties) {
			for(let property of properties) {
				this_form.button("§2"+String(property)+"§r = "+String(found_entity.getDynamicProperty(property)));
				button_callbacks.set(button_idx, { type: "p", item: property });
				button_idx++;
			}
		}
		show_detail = true;
	}
	
	this_form.show(player).then((response) => {
		if(response === undefined || response.cancelled) {
			return; // do nothing? Drop out of the forms entirely?
		} else {
			if(response.selection) {
				if(response.selection > 1) {
					let val = button_callbacks.get(response.selection);
					let choose_form = new mcui.ActionFormData().title("EDIT "+found_entity.typeId+" PROPERTY");
					choose_form.body({rawtext: [{translate: NS+"property.choose.body",with: ["\n"]}]});
					choose_form.button({rawtext: [{translate: NS+"property.choose.string",with: ["\n"]}]});
					choose_form.button({rawtext: [{translate: NS+"property.choose.number",with: ["\n"]}]});
					choose_form.button({rawtext: [{translate: NS+"property.choose.boolean",with: ["\n"]}]});
					choose_form.button({rawtext: [{translate: NS+"property.choose.delete",with: ["\n"]}]});
					choose_form.show(player).then((response) => {
						if(response === undefined || response.cancelled) {
							return; // do nothing? Drop out of the forms entirely?
						}
						if(response.selection == 0) {
							// Open an editor for this property
							let edit_form = new mcui.ModalFormData().title(found_entity.typeId+" TEXT VALUE");
							edit_form.textField(val.item+" =", String(found_entity.getDynamicProperty(val.item)));
							edit_form.show(player).then((response) => {
								if(response === undefined || response.cancelled) {
									return; // do nothing? Drop out of the forms entirely?
								}
								if(response && response.formValues) {
									if(response.formValues.length >= 1) {
										if(response.formValues[0] != "") {
											if(found_entity) {
												found_entity.setDynamicProperty(val.item, response.formValues[0] );
											} else {
												player.setDynamicProperty(val.item, response.formValues[0]);
											}
										}
									}
								}
							})
						} else if(response.selection == 1) {
							// Open an editor for this property
							let edit_form = new mcui.ModalFormData().title(found_entity.typeId+" NUMBER VALUE");
							edit_form.textField(val.item + " =", String(found_entity.getDynamicProperty(val.item)));
							edit_form.show(player).then((response) => {
								if(response === undefined || response.cancelled) {
									return; // do nothing? Drop out of the forms entirely?
								}
								if(response && response.formValues) {
									if(response.formValues.length >= 1) {
										if(response.formValues[0] != "") {
											if(found_entity) {
												found_entity.setDynamicProperty(val.item, parseInt(response.formValues[0]) );
											} else {
												player.setDynamicProperty(val.item, parseInt(response.formValues[0]));
											}
										}
									}
								}
							})
						} else if(response.selection == 2) {
							// Open an editor for this property
							let edit_form = new mcui.ModalFormData().title(found_entity.typeId+" BOOLEAN VALUE");
							let curr_value = found_entity.getDynamicProperty(val.item);
							if(curr_value != true && curr_value != false) {
								curr_value = false;
							}
							
							edit_form.toggle(val.item + " =", curr_value);
							edit_form.show(player).then((response) => {
								if(response === undefined || response.cancelled) {
									return; // do nothing? Drop out of the forms entirely?
								}
								if(response && response.formValues) {
									if(response.formValues.length >= 1) {
										if(found_entity) {
											found_entity.setDynamicProperty(val.item, response.formValues[0] );
										} else {
											player.setDynamicProperty(val.item, response.formValues[0]);
										}
									}
								}
							})
						} else if(response.selection == 3) {
							found_entity.setDynamicProperty(val.item, undefined );
						}

					})
				}
				else if(response.selection == 1) {	// Add a new Property
					if(found_entity) {	// I'm looking at something
						let choose_form = new mcui.ActionFormData().title("NEW "+found_entity.typeId+" PROPERTY");
						choose_form.body({rawtext: [{translate: NS+"property.choose.body",with: ["\n"]}]});
						choose_form.button({rawtext: [{translate: NS+"property.choose.string",with: ["\n"]}]});
						choose_form.button({rawtext: [{translate: NS+"property.choose.number",with: ["\n"]}]});
						choose_form.button({rawtext: [{translate: NS+"property.choose.boolean",with: ["\n"]}]});
						choose_form.show(player).then((response) => {
							if(response === undefined || response.cancelled) {
								return; // do nothing? Drop out of the forms entirely?
							}
							if(response.selection == 0) {				
								let new_form = new mcui.ModalFormData().title({rawtext: [{translate: NS+"property.new.title.text",with: ["\n"]}]});
								new_form.textField({rawtext: [{translate: NS+"property.name",with: ["\n"]}]}, ""); // The new Property name
								new_form.textField({rawtext: [{translate: NS+"property.value",with: ["\n"]}]}, ""); // The new Property value
								new_form.show(player).then((response) => {
									if(response === undefined || response.cancelled) {
										return; // do nothing? Drop out of the forms entirely?
									}
									if(response && response.formValues) {
										if(response.formValues.length >= 1) {
											if(response.formValues[0] != "") {
												if(found_entity) {
													found_entity.setDynamicProperty(response.formValues[0], response.formValues[1] );
												} else {
													player.setDynamicProperty(response.formValues[0], response.formValues[1]);
												}
											}
										}
									}
								})
							} else if(response.selection == 1) {
								let new_form = new mcui.ModalFormData().title({rawtext: [{translate: NS+"property.new.title.number",with: ["\n"]}]});
								new_form.textField({rawtext: [{translate: NS+"property.name",with: ["\n"]}]}, ""); // The new Property name
								new_form.textField({rawtext: [{translate: NS+"property.value",with: ["\n"]}]}, ""); // The new Property value
								new_form.show(player).then((response) => {
									if(response === undefined || response.cancelled) {
										return; // do nothing? Drop out of the forms entirely?
									}
									if(response && response.formValues) {
										if(response.formValues.length >= 1) {
											if(response.formValues[0] != "") {
												if(found_entity) {
													found_entity.setDynamicProperty(response.formValues[0], parseInt(response.formValues[1] ));
												} else {
													player.setDynamicProperty(response.formValues[0], parseInt(response.formValues[1]));
												}
											}
										}
									}
								})							
							} else if(response.selection == 2) {
								let new_form = new mcui.ModalFormData().title({rawtext: [{translate: NS+"property.new.title.boolean",with: ["\n"]}]});
								new_form.textField({rawtext: [{translate: NS+"property.name",with: ["\n"]}]}, ""); // The new Property name
								new_form.toggle({rawtext: [{translate: NS+"property.value",with: ["\n"]}]}, true);
								new_form.show(player).then((response) => {
									if(response === undefined || response.cancelled) {
										return; // do nothing? Drop out of the forms entirely?
									}
									if(response && response.formValues) {
										if(response.formValues.length >= 1) {
											if(found_entity) {
												found_entity.setDynamicProperty(response.formValues[0], response.formValues[1] );
											} else {
												player.setDynamicProperty(response.formValues[0], response.formValues[1]);
											}
										}
									}
								})
							}
						})
					}
				}
			}
		}
	});
};


// DATABASE stuff.
