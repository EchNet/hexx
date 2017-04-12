define([], function() {

	return {
		config: {
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
				lineWidth: 2,
				proximityPlacement: 1,
				constraints: {
					"red2": [ "red1" ],
					"red3": [ "red2" ],
					"green2": [ "green1" ],
					"green3": [ "green2" ]
				}
			}
		},

		data: {
			palette: {
				name: "palette0",
				contents: [
					{
						value: "castle",
						image: {
							url: "img/castle.jpg"
						}
					},
					{
						value: "red1",
						fill: "rgba(255,225,225,1)"
					},
					{
						value: "red2",
						fill: "rgba(255,150,150,1)"
					},
					{
						value: "red2",
						fill: "rgba(255,0,0,1)"
					},
					{
						value: "green1",
						fill: "rgba(100,255,100,1)"
					},
					{
						value: "green2",
						fill: "rgba(70,220,70,1)"
					},
					{
						value: "green3",
						fill: "rgba(0,150,0,1)"
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
		}
	}
})
