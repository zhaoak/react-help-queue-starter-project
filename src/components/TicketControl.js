import React, {useState, useEffect} from 'react';
import NewTicketForm from './NewTicketForm';
import TicketList from './TicketList';
import EditTicketForm from './EditTicketForm';
import TicketDetail from './TicketDetail';
import { db, auth } from './../firebase.js';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { formatDistanceToNow } from 'date-fns';

function TicketControl() {

  const [formVisibleOnPage, setFormVisibleOnPage] = useState(false);
  const [mainTicketList, setMainTicketList] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const queryByTimestamp = query(
      collection(db, "tickets"),
      orderBy('timeOpen'));
    const unSubscribe = onSnapshot(
      queryByTimestamp,
      (querySnapshot) => {
        // update mainTicketList with updated ticket data
        const tickets = [];
        querySnapshot.forEach((doc) => {
          const timeOpen = doc.get('timeOpen', {serverTimestamps: "estimate"}).toDate();
          const jsDate = new Date(timeOpen);
          tickets.push({
            names: doc.data().names,
            location: doc.data().location,
            issue: doc.data().issue,
            timeOpen: jsDate,
            formattedWaitTime: formatDistanceToNow(jsDate),
            id: doc.id
          })
        });
        setMainTicketList(tickets);
      },
      (error) => {
        // handle errors
        setError(error.message);
      }
    );

    return () => unSubscribe();
  }, []);

  useEffect(() => {
    function updateTicketElapsedWaitTime() {
      const newMainTicketList = mainTicketList.map(ticket => {
        const newFormattedWaitTime = formatDistanceToNow(ticket.timeOpen);
        return {...ticket, formattedWaitTime: newFormattedWaitTime};
      });
      setMainTicketList(newMainTicketList);
    }

    const waitTimeUpdateTimer = setInterval(() =>
      updateTicketElapsedWaitTime(),
      60000
    );
    
    return function cleanup() {
      clearInterval(waitTimeUpdateTimer);
    }
  }, [mainTicketList]);

  const handleClick = () => {
    if (selectedTicket != null) {
      setFormVisibleOnPage(false);
      setSelectedTicket(null);
      setEditing(false);
    } else {
        setFormVisibleOnPage(!formVisibleOnPage);
      }
    }

  const handleDeletingTicket = async (id) => {
    await deleteDoc(doc(db, "tickets", id));
    setSelectedTicket(null);
  }

  const handleEditClick = () => {
    setEditing(true);
  }

  const handleEditingTicketInList = async (ticketToEdit) => {
    const ticketRef = doc(db, "tickets", ticketToEdit.id);
    await updateDoc(ticketRef, ticketToEdit);
    setSelectedTicket(null);
    setEditing(false);
  }

  const handleAddingNewTicketToList = async (newTicketData) => {
    await addDoc(collection(db, "tickets"), newTicketData);
    setFormVisibleOnPage(false);
  }

  const handleChangingSelectedTicket = (id) => {
    const selection = mainTicketList.filter(ticket => ticket.id === id)[0];
    setSelectedTicket(selection);
  }
  if (auth.currentUser == null) {
    return (
      <h1>You must be signed in to access the queue.</h1>
    );
  } else if (auth.currentUser != null) {
    let currentlyVisibleState = null;
    let buttonText = null; 
    if (error) {
      currentlyVisibleState = <p>Big ol' error: {error}</p>
    } else if (editing) {      
      currentlyVisibleState = <EditTicketForm ticket = {selectedTicket} onEditTicket = {handleEditingTicketInList} />
      buttonText = "Return to Ticket List";
    } else if (selectedTicket != null) {
      currentlyVisibleState = <TicketDetail 
      ticket={selectedTicket} 
      onClickingDelete={handleDeletingTicket}
      onClickingEdit = {handleEditClick} />
      buttonText = "Return to Ticket List";
    } else if (formVisibleOnPage) {
      currentlyVisibleState = <NewTicketForm onNewTicketCreation={handleAddingNewTicketToList}/>;
      buttonText = "Return to Ticket List"; 
    } else {
      currentlyVisibleState = <TicketList onTicketSelection={handleChangingSelectedTicket} ticketList={mainTicketList} />;
      buttonText = "Add Ticket"; 
    }

    return (
      <React.Fragment>
        {currentlyVisibleState}
      {error ? null : <button onClick={handleClick}>{buttonText}</button>}
      </React.Fragment>
    );
  }
}

export default TicketControl;

