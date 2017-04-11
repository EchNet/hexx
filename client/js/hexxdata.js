HEXX.config = {
	palette: {
		elementRadius: 25,
		lineStyle: "rgba(100,100,100,0.8)",
		lineWidth: 1
	},
	canvas: {
		width: 520,
		height: 360, 
		elementRadius: 30,
		originX: 260,
		originY: 180,
		lineStyle: "rgba(150,150,150,0.5)",
		lineWidth: 2
	}
};

HEXX.data = {
	palette: {
		name: "palette0",
		contents: [
			{
				name: "castle",
				value: 0,
				image: {
					url: "img/castle.jpg"
				}
			},
			{
				value: 10,
				fill: "rgba(255,225,225,1)"
			},
			{
				value: 11,
				fill: "rgba(255,150,150,1)"
			},
			{
				value: 12,
				fill: "rgba(255,0,0,1)"
			},
			{
				value: 20,
				fill: "rgba(125,125,255,1)"
			},
			{
				value: 30,
				fill: "rgba(100,200,100,1)"
			}
		]
	},
	canvas: {
		name: "rich",
		contents: [
			{
				row: 0,
				column: 0,
				image: {
					url: "img/castle.jpg"
				}
			}
		],
		initialContents: [
			{
				row: 0,
				column: 0,
				image: {
					url: "img/castle.jpg"
				}
			}
		]
	}
};
