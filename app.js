//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
//const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
// const res = require("express/lib/response");
// const { redirect } = require("express/lib/response");
const _ = require("lodash")

const app = express();
const PORT = process.env.PORT || 3000

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

 const urlAtlas = "mongodb://127.0.0.1:27017/"
//const urlAtlas="mongodb+srv://sihar:HtcvdoVxADwcbSOY@cluster0.cwxk3fs.mongodb.net/"
//const urlAtlas="mongodb+srv://admin-akbarsuhaib-mh:Test1234@clustertest.3gcnj0c.mongodb.net/?retryWrites=true&w=majority/"
const dbName = "todolistDB"
// console.log(`${url}${dbName}`);

// mongoose.connect(`${urlAtlas}`)


const connectDB = async () => {
  try {
     const conn = await mongoose.connect(`${urlAtlas}${dbName}`)
    //const conn = mongoose.connect(urlAtlas+dbName);
    console.log(`mongodb connected :`);
  } catch (error) {
    console.log(error);
    process.exit(1)
  }
}


const itemSchema = {
  name:String
}

const Item = mongoose.model(
  "Items",
  itemSchema
)

const item1 = new Item({
  name:"welcome to your todolist"
})

const item2 = new Item({
  name:"hit + button to ad a new item"
})

const item3 = new Item({
  name:"<-- hit this to delete an item"
})

const defaultItems = [item1, item2, item3]

const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model(
  "List",
  listSchema
) 

app.get("/", async function (req, res) {
  const data = await Item.find({})

  if (data.length === 0) {
    Item.insertMany(defaultItems)
    
  console.log("successfully saved default database");
    res.redirect("/")
  } else {
    res.render("list", {
      listTitle: "Today",
      newListItems: data
    })
  }
});

app.get("/:customListName",async (req, res) => {
  const customListName = _.capitalize(req.params.customListName)

  const compareList = await List.findOne({ name: customListName })
  if (compareList != null) {
    // show existing list
    res.render("list", {
      listTitle: compareList.name,
      newListItems:compareList.items
    })
  } else {
    // create a new list
    const list = new List({
      name: customListName,
      items: defaultItems
    })
    
    list.save()

    res.redirect(`/${customListName}`)

  }

})

app.post("/", async function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name:itemName
  })

  console.log(listName);
  if (listName === "Today") {
    item.save()
    res.redirect("/")
  } else {
    const findList = await List.findOne(
      {name:listName}
    )
    console.log(findList);
    findList.items.push(item)
    findList.save()
    res.redirect(`/${listName}`)
  }


  
});

app.post("/delete", async (req, res) => {
  const checkedItemId = req.body.checkbox
  const listName = req.body.listName

  if (listName === "Today") {
    const deleteItem = await Item.findByIdAndRemove(checkedItemId)
    console.log(`${deleteItem.name} is deleted`);
    res.redirect("/")
  } else {
    const updateItem = await List.findOneAndUpdate(
      { name: listName },
      {
        $pull:
        {
          items:
          {_id:checkedItemId}
        }
      }
    )

    console.log(`${updateItem} deleted`);
    res.redirect(`/${listName}`)
  }
  
})

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});


connectDB().then(() => {
  app.listen(PORT, function() {
    console.log(`listening for requests ${PORT}`);
  });
})

