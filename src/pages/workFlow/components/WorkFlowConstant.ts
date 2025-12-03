 
 
export const columnsTaskmonitoring = [
	{ name: 'Name', key:"name",  sortable: true, width: '15%' ,statusdisplay : false },
	{ name: 'status', key:"status",  sortable: true, width: '15%' ,statusdisplay : true,},
	{ name: 'Creation time', key:"creation_time",   sortable: false, width: '15%' ,format_date:true,statusdisplay : false},
	{ name: 'Time of preset completion', key:"time_of_preset_completion",  format_date:true, sortable: false, width: '15%' ,statusdisplay : false},
	{ name: 'Time of actual completion',  key:"Name",  sortable: false, width: '15%',statusdisplay : false },
	{ name: 'Assigned to',  key:"assignable_to",sortable: false, width: '15%' ,statusdisplay : false},
];


// export const dataTaskmonitoring = [ 
//     { 
//         id: "1",
//         task: "Task 1",
//         status: "In Progress",
//         creationTime: "2024-05-20T10:30:00Z",
//         presetCompletionTime: "2024-05-25T10:30:00Z",
//         actualCompletionTime: "2024-05-26T14:00:00Z",
//         assignedTo: "Alice"
//     },
//     {
//         id: "2",
//         Name: "Task 2",
//         status: "Completed",
//         creationTime: "2024-05-21T11:00:00Z",
//         presetCompletionTime: "2024-05-26T11:00:00Z",
//         actualCompletionTime: "2024-05-25T16:00:00Z",
//         assignedTo: "Bob"
//     },
//     {
//         id: "3",
//         Name: "Task 3",
//         status: "Pending",
//         creationTime: "2024-05-22T12:00:00Z",
//         presetCompletionTime: "2024-05-27T12:00:00Z",
//         actualCompletionTime: "",
//         assignedTo: "Charlie"
//     }
// ];
