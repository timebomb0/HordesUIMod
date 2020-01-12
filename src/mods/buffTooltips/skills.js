// Source: https://hordes.io/info/skills
export default {
	// Warrior
	21: {
		name: 'Armor Reinforcement',
		description: 'Passively increase your Defense.',
		stats: ['+ Defense', '+ Increased Aggro Generation'],
	},
	2: {
		name: 'Bulwark',
		description:
			'Increase your block chance, while raising your damage for each successful block.',
		stats: ['+ Block'],
		notes: ['Stackable buff on block'],
	},
	18: {
		name: 'Centrifugal Laceration',
		description:
			'Your Crescent Swipe lacerates enemies, causing them to bleed for additional Damage.',
		notes: ['x% as additional damage over 10 seconds'],
	},
	33: {
		name: 'Charge',
		description:
			'Charge towards your target while also stunning it. Stun duration increases with charge distance.',
	},
	20: {
		name: "Crusader's Courage",
		description: 'You and your party members gain additional Defense.',
		stats: ['+ Defense'],
	},
	17: {
		name: 'Colossal Reconstruction',
		description: 'While active you are healed each time you block an attack.',
	},
	19: {
		name: 'Unholy Warcry',
		description: 'You and your party members deal additional Damage.',
		stats: ['+ Min Dmg', '+ Max Dmg'],
	},
	18: {
		// This is the effect triggered by Centrifugal Laceration
		name: 'Bleed',
		description:
			'Crescent Swipe lacerates enemies, causing them to bleed for additional Damage.',
		stats: ['x% as additional damage over 10 seconds'],
	},
	buffBlock: {
		name: 'Block',
		description: "Blocks the damage from an enemy's attack.",
	},
	// Mage
	4: {
		name: 'Frost Bolt',
		description:
			'Freezes targets for up to 4 stacks, at which they will be stunned and take 50% increased damage.',
	},
	14: {
		name: 'Chilling Radiance',
		description:
			'Emit a chilling shockwave of ice around you, damaging and freezing enemies. Increases the critical hit chance of some of your spells.',
		stats: [
			'Empower Crit% of Ice bolt',
			'Empower Crit% of Icicle Orb',
			'+100 % Movement Spd. Reduction',
		],
	},
	23: {
		name: 'Ice Shield',
		description: 'Protects you against the next incoming attacks.',
		stats: ['# attacks blocked'],
	},
	16: {
		name: 'Hypothermic Frenzy',
		description: 'You gain Haste and all your damage output is increased.',
		stats: ['+ Haste', '+ Increased Dmg'],
	},
	24: {
		name: 'Enchantment',
		description: 'Increase your targets Damage.',
		stats: ['+ Min Dmg', '+ Max Dmg'],
	},
	22: {
		name: 'Arctic Aura',
		description: 'You and your party members gain additional Crit%.',
		stats: ['+ Critical'],
	},
	frozenBuff: {
		name: 'Frozen',
		description:
			'Freezes targets for up to 4 stacks, at which they will be stunned and take 50% increased damage.',
	},
	// Archer
	10: {
		name: 'Serpent Arrows',
		description: 'Your Precise Shots will jump to additional targets while active.',
		stats: ['# Jumps', '##% damage per Jump'],
	},
	11: {
		name: 'Invigorate',
		description: 'Instantly recovers MP and increases your damage temporarily.',
		stats: ['+ Increased damage'],
	},
	29: {
		name: 'Poison Arrows',
		description:
			'Your Precise Shot applies a poisonous Debuff on hit, damaging and slowing your enemies.',
		stats: ['###% per stack as additional damage over 10 seconds'],
	},
	27: {
		name: 'Pathfinding',
		description: 'You and your party members gain additional Movement Speed.',
		stats: ['+ Move Spd'],
	},
	26: {
		name: 'Cranial Punctures',
		description: 'Passively increase your Crit%.',
		stats: ['+ Critical'],
	},
	25: {
		name: 'Temporal Dilation',
		description: 'You and your party members gain additional Haste.',
		stats: ['+ Haste'],
	},
	31: {
		// Technically this is an effect brought on by Precise Shot
		name: 'Swift Shot',
		description:
			'Increases the damage of your next Swift Shots and allows them to be cast instantly.',
	},
	38: {
		name: 'Dash',
		description:
			'You dash into your current direction, instantly resetting the cooldown of Precise Shot. Your next Precise Shot is an instant cast.',
	},
	// Shaman
	// TODO: Figure out what the post-summon speed buff icon URL
	12: {
		name: 'Decay',
		description: 'Curse your enemy with a spell of decay, dealing damage over time.',
		stats: ['DMG', '+ Movement Spd. Reduction'],
	},
	7: {
		name: 'Revitalize',
		description:
			'Heal a friendly target over a short duration, stacking up to 3 times while also increasing the power of your Mend.',
		stats: ['Heal'],
	},
	13: {
		name: "Mimir's Well",
		description:
			'You and your party members quickly regenerate mana over a short period of time.',
		stats: ['MP recovered'],
	},
	36: {
		name: 'Spirit Animal',
		description: 'Turn into your spirit animal for additional movementspeed.',
		stats: ['+ Move Spd'],
	},
	28: {
		name: 'Canine Howl',
		description: 'You and your entire party enrages with haste, causing you to attack faster.',
		stats: ['+ Haste'],
	},
	37: {
		name: 'Agonize',
		description:
			'Turns your target into a zombie, interrupting all actions, slowing it down, and reducing received healing for the duration.',
		stats: ['Movement Spd. Reduction', 'Healing Reduction'],
	},
	30: {
		name: 'Healing Totem',
		description: 'Place a totem on the ground healing your entire party.',
		stats: ['Heal'],
	},
	// Other
	39: {
		name: 'Mount Riding',
		description: 'Allows you to ride ground mounts',
		stats: ['+60 Move Spd'],
	},
	potionMp: {
		name: 'MP Potion',
		stats: ['MP Recovered'],
	},
	potionhp: {
		name: 'HP Potion',
		stats: ['HP Recovered'],
	},
	dazedBuff: {
		name: 'Dazed',
		description:
			'When you are hit from behind, you can be dazed. This slows your movement speed and dismounts you.',
		stats: ['Movement Spd. Reduction'],
	},
};
