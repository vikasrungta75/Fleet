import { SVGProps } from "react";

export interface IMapbutton{
	id: string,
	icon?: string | ((props: SVGProps<SVGSVGElement>) => JSX.Element),
	text: string,
	title: string,
	onClick: Function | any,
	className?: string,
	tooltip?: string,
	tooltipRight?: string
}
export interface IEditLocationMapButton{
	id: string,
	icon?: any,
	text: string,
	title: string,
	onClick: Function | any,
	className?: string,
	tooltip?: string,
	tooltipRight?: string
}