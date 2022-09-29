import React, { useEffect, useState } from "react";
import "../index.css";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Fab,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  ListSubheader,
  Paper,
  Snackbar,
  TextField,
} from "@material-ui/core";
import { Alert, Autocomplete, TreeItem, TreeView } from "@material-ui/lab";
import axios from "axios";
import {
  Add,
  Edit,
  Delete,
  FilterList,
  ChevronRight,
  ExpandMore,
} from "@material-ui/icons";
import { useStyles } from "../Styles";

export const Task = () => {
  const classes = useStyles();
  const [Open, setOpen] = useState(false);
  const [DialogMode, setDialogMode] = useState("");
  const [SnackBarToggle, setsnackBarToggle] = useState(false);
  const [SnackBarMsg, setSnackBarMsg] = useState("");
  const [Touched, setTouched] = useState(false);
  let [Tasks, setTasks] = useState<any[]>([]);
  const [TaskData, setTaskData] = useState<any>({
    ID: undefined,
    Name: undefined,
    ParentID: undefined,
    Status: "In Progress",
    Child: undefined,
  });
  const setDefaultTaskData = () => {
    setTaskData({
      ID: undefined,
      Name: undefined,
      ParentID: undefined,
      Status: "In Progress",
      Child: undefined,
    });
  };
  const [FilterStatus, setFilterStatus] = useState<any>({
    InProgress: true,
    Done: true,
    Complete: true,
  });

  //Show snackbar function for 2.5 seconds
  const showSnackBar = (message: any) => {
    setSnackBarMsg(message);
    setsnackBarToggle(true);
    setTimeout(() => {
      setsnackBarToggle(false);
    }, 2500);
  };

  //Read list from db
  const onRead = async () => {
    await axios
      .post(`http://localhost:2000/task/readList`, {})
      .then((res: any) => {
        setTasks(res.data);
      });
  };

  //Insert list to db
  const onInsert = async () => {
    const Data = { ...TaskData, ParentID: TaskData?.ParentID?.ID || null };
    delete Data.Child;
    await axios
      .post(`http://localhost:2000/task/insert`, Data)
      .then((res: any) => {
        onUpdateAll(Data);
      });
    setDefaultTaskData();
    setOpen(false);
    setTouched(false);
  };

  //Update list in db
  const onUpdateAll = (data?: any) => {
    Tasks.map((i: any) => {
      delete i?.Child;
    });

    //Update complete/done on parent node
    const unCompleteParent = (obj: any) => {
      let ParentIndex = Tasks.map((i: any) => i.ID).indexOf(obj?.ParentID);
      Tasks[ParentIndex]?.Status === "Complete" &&
        (Tasks[ParentIndex].Status = "Done");
    };

    if (data) {
      data = { ...TaskData, ParentID: TaskData?.ParentID?.ID };
      let Index = Tasks.map((i: any) => i.ID).indexOf(data?.ID);
      Tasks[Index] = data;
      unCompleteParent(data);
    }

    axios
      .post(`http://localhost:2000/task/updateList`, Tasks)
      .then((res: any) => {
        onRead();
        showSnackBar(`${data && !data?.ID ? "Added" : "Updated"} successfully`);
      });
    setDefaultTaskData();
    setOpen(false);
    setTouched(false);
  };

  //Delete list in db
  const onDelete = () => {
    let IDs: any[] = [TaskData?.ID];

    //Get all child node ID to delete
    const ReturnAllIDs = (obj: any) => {
      obj?.Child?.map((i: any) => {
        IDs.push(i?.ID);
      });
    };
    ReturnAllIDs(TaskData);
    axios.post(`http://localhost:2000/task/delete`, IDs).then((res: any) => {
      onRead();
      showSnackBar(`Deleted successfully`);
    });
    setDefaultTaskData();
    setOpen(false);
    setTouched(false);
  };

  useEffect(() => {
    onRead();
  }, []);

  //onChange for add/edit
  const onTaskDataChange = (property: any, value: any) => {
    setTaskData({
      ...TaskData,
      [property]: value,
    });
  };

  //onChange for filter
  const onFilterStatusChange = (property: any, value: any) => {
    setFilterStatus({
      ...FilterStatus,
      [property]: value,
    });
  };

  //onChange for checkbox
  const onCheckBoxChange = (obj: any, checked: boolean) => {
    let tempArr: any = Tasks.map((i: any) => {
      if (obj?.ID === i?.ID) {
        return {
          ...i,
          Status: checked
            ? !Array.isArray(i?.Child) ||
              i?.Child?.filter((k: any) => k.Status != "Complete").length === 0
              ? "Complete"
              : "Done"
            : "In Progress",
        };
      }
      return i;
    });

    //Update complete/done on parent node
    const completeParent = (parent: any) => {
      if (parent?.ParentID) {
        let gang: any[] = tempArr?.filter(
          (y: any) => y?.ParentID === parent?.ParentID
        );
        let gangCompleted: any[] = gang?.filter(
          (y: any) => y.Status === "Complete"
        );
        let ParentIndex = tempArr
          .map((i: any) => i.ID)
          .indexOf(parent?.ParentID);
        if (
          gang?.length === gangCompleted?.length &&
          tempArr[ParentIndex].Status === "Done"
        ) {
          tempArr[ParentIndex].Status = "Complete";
        } else {
          !checked &&
            (tempArr[ParentIndex].Status =
              tempArr[ParentIndex].Status === "Complete"
                ? "Done"
                : "In Progress");
        }
        completeParent(tempArr.find((i: any) => i.ID === parent?.ParentID));
      }
    };

    completeParent(obj);
    setTasks(tempArr);
    setTouched(true);
  };

  //Get all child node ID to hide in autocomplete drop dowm list to prevent circular dependency
  const CheckChildNode = (obj: any) => {
    let ChildNodeIDs: any[] = [obj.ID];
    const GetChildNodeIDs = (parent: any) => {
      parent?.Child?.map((child: any) => {
        ChildNodeIDs.push(child?.ID);
        Array.isArray(child?.Child) && GetChildNodeIDs(child);
      });
    };
    GetChildNodeIDs(obj);
    return ChildNodeIDs;
  };

  //Change the flat list to tree with child
  const ListToTree = (data: any) => {
    data?.map((i: any) => {
      delete i?.Child;
    });
    const Parent = data?.filter(
      (i: any) => i?.ParentID === "undefined" || i?.ParentID === null
    );
    const Child = data?.filter(
      (i: any) => i?.ParentID !== "undefined" && i?.ParentID !== null
    );
    const translator = (Parent: any, Child: any) => {
      Parent?.map((parent: any) => {
        Child?.map((current: any, index: any) => {
          if (current?.ParentID === parent?.ID) {
            let temp = JSON?.parse(JSON?.stringify(Child));
            temp?.splice(index, 1);
            translator([current], temp);
            parent?.Child
              ? parent.Child.push(current)
              : (parent.Child = [current]);
          }
        });
      });
    };
    translator(Parent, Child);
    return Parent;
  };

  //Dialog box component
  const dialog = (
    <Dialog
      open={Open}
      onClose={() => setOpen(false)}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle className={classes.dialogTitle}>
        {DialogMode} Task
      </DialogTitle>
      <DialogContent>
        {DialogMode === "Add" || DialogMode == "Edit" ? (
          <>
            <TextField
              margin="normal"
              name="Name"
              required
              label="Task Name"
              fullWidth
              value={TaskData?.Name || ""}
              onChange={(e) => onTaskDataChange(e.target.name, e.target.value)}
              error={
                Tasks.find(
                  (i: any) => i.Name === TaskData.Name && i.ID !== TaskData.ID
                ) && true
              }
              helperText={
                Tasks.find(
                  (i: any) => i.Name === TaskData.Name && i.ID !== TaskData.ID
                ) && "Task name must be unique!"
              }
            />
            <Autocomplete
              options={Tasks.filter(
                (k: any) =>
                  !CheckChildNode(TaskData).find((m: any) => m === k.ID)
              )}
              style={{ width: "100%" }}
              getOptionLabel={(option: any) => option?.Name || ""}
              value={TaskData?.ParentID || ""}
              onChange={(e: any, value: any) => {
                onTaskDataChange("ParentID", value);
              }}
              renderInput={(params: any) => (
                <TextField
                  {...params}
                  fullWidth
                  margin="normal"
                  label="Parent Task ID"
                  helperText="Leave empty to create a task with no parent"
                />
              )}
            />
          </>
        ) : DialogMode === "Delete" ? (
          <DialogContentText>
            Confirm delete task {TaskData?.Name}? This will delete all its
            dependencies too if any.
          </DialogContentText>
        ) : (
          <FormControl component="fieldset" className={classes.formControl}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={FilterStatus?.InProgress}
                    color="primary"
                    onChange={(e) =>
                      onFilterStatusChange(e.target.name, e.target.checked)
                    }
                    name="InProgress"
                  />
                }
                label="In Progress"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={FilterStatus?.Done}
                    color="primary"
                    onChange={(e) =>
                      onFilterStatusChange(e.target.name, e.target.checked)
                    }
                    name="Done"
                  />
                }
                label="Done"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={FilterStatus?.Complete}
                    color="primary"
                    onChange={(e) =>
                      onFilterStatusChange(e.target.name, e.target.checked)
                    }
                    name="Complete"
                  />
                }
                label="Complete"
              />
            </FormGroup>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions>
        {DialogMode !== "Filter" && (
          <Button
            onClick={() => {
              setDefaultTaskData();
              setOpen(false);
            }}
            color="primary"
          >
            Cancel
          </Button>
        )}
        <Button
          onClick={() =>
            DialogMode === "Add"
              ? onInsert()
              : DialogMode === "Edit"
              ? onUpdateAll(TaskData)
              : DialogMode === "Delete"
              ? onDelete()
              : setOpen(false)
          }
          color="primary"
          disabled={
            DialogMode !== "Filter" &&
            (!TaskData.Name ||
              Tasks.find(
                (i: any) => i.Name === TaskData.Name && i.ID !== TaskData.ID
              ))
          }
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );

  //Render each list component
  const renderTreeList = (i: any) => {
    return (
      <TreeItem
        key={i?.ID}
        nodeId={i.ID.toString()}
        label={
          <>
            <ListItem component="div">
              <ListItemIcon>
                <Checkbox
                  color={i?.Status === "Complete" ? `primary` : `secondary`}
                  checked={
                    i?.Status === "Done" || i?.Status === "Complete"
                      ? true
                      : false
                  }
                  onChange={(e) => onCheckBoxChange(i, e.target.checked)}
                  size="small"
                />
              </ListItemIcon>
              <ListItemText
                primary={
                  <>
                    <div className="titleAndId">
                      <span className={classes.titleText}>
                        {i?.Name} |{" "}
                        <span style={{ color: "black" }}>ID: {i?.ID}</span>
                      </span>
                    </div>
                    <div
                      className="progressReport"
                      style={{
                        fontSize: 12,
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <div className="total">
                        {" "}
                        Sub-Tasks: {i?.Child?.length || 0}{" "}
                      </div>{" "}
                      <div className="done">
                        {" "}
                        Done:{" "}
                        {i?.Child?.filter((x: any) => x.Status === "Done")
                          ?.length || 0}{" "}
                      </div>
                      <div className="complete">
                        Complete:{" "}
                        {i?.Child?.filter((x: any) => x.Status === "Complete")
                          ?.length || 0}{" "}
                      </div>
                    </div>
                  </>
                }
                secondary={
                  <div className="test3">
                    <div
                      className="currentStatus"
                      style={{
                        fontSize: 15,
                      }}
                    >
                      {" "}
                      {i?.Status}
                    </div>
                  </div>
                }
              />
              <>
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => {
                      setTaskData({
                        ID: i?.ID,
                        Name: i?.Name,
                        ParentID:
                          Tasks.find((j: any) => j.ID === i?.ParentID) || null,
                        Status: i?.Status,
                        Child: i?.Child,
                      });
                      setDialogMode("Edit");
                      setOpen(true);
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => {
                      setTaskData({
                        ID: i?.ID,
                        Name: i?.Name,
                        ParentID:
                          Tasks.find((j: any) => j.ID === i?.ParentID) || null,
                        Status: i?.Status,
                        Child: i?.Child,
                      });
                      setDialogMode("Delete");
                      setOpen(true);
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </ListItemSecondaryAction>
              </>
            </ListItem>
            <Divider />
          </>
        }
        onLabelClick={(e) => e.stopPropagation()}
      >
        {i?.Child?.length > 0 && i.Child.map((j: any) => renderTreeList(j))}
      </TreeItem>
    );
  };

  //Main return
  return (
    <Paper className={classes.paper}>
      <Grid
        container
        direction="row"
        justify="space-evenly"
        alignItems="center"
      >
        <Grid item xs={12}>
          <List
            component="nav"
            aria-labelledby="nested-list-subheader"
            subheader={
              <ListSubheader className={classes.titleHeader}>
                Tasks
              </ListSubheader>
            }
          ></List>
          <TreeView
            className={classes.root}
            defaultCollapseIcon={<ExpandMore />}
            defaultExpandIcon={<ChevronRight />}
          >
            {Tasks?.length === 0 ? (
              <div className={classes.dialogTitle}>
                No task added yet. Please add one by tapping the + button!
              </div>
            ) : (
              <div className="test">
                {ListToTree(
                  Tasks?.filter(
                    (f: any) =>
                      (FilterStatus.InProgress && f.Status === "In Progress") ||
                      (FilterStatus.Done && f.Status === "Done") ||
                      (FilterStatus.Complete && f.Status === "Complete")
                  )
                )?.map((i: any) => renderTreeList(i))}
              </div>
            )}
          </TreeView>
        </Grid>
      </Grid>
      <br />
      <br />
      <Button
        className={classes.button}
        variant="contained"
        size="small"
        disabled={!Touched}
        onClick={() => onUpdateAll()}
      >
        Save
      </Button>
      <Fab
        size="medium"
        className={classes.fabFilter}
        color="primary"
        aria-label="filter"
        onClick={() => {
          setDialogMode("Filter");
          setOpen(true);
        }}
      >
        <FilterList />
      </Fab>
      <Fab
        size="medium"
        className={classes.fabAdd}
        color="primary"
        aria-label="add"
        onClick={() => {
          setDialogMode("Add");
          setOpen(true);
        }}
      >
        <Add />
      </Fab>

      <Snackbar open={SnackBarToggle}>
        <Alert severity="success">{SnackBarMsg}</Alert>
      </Snackbar>
      {dialog}
    </Paper>
  );
};
