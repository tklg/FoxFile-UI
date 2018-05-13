import {connect} from 'react-redux';
import {scrollTo} from '../actions/sidescroll';
import {dragEnter, dragLeave, dragDrop} from '../actions/dragdrop';
import _FolderItem from '../components/FolderItem';

const mapStateToProps = state => {
	//console.log(state.filetree.dragging);
	return {
		dragging: state.filetree.dragging,
	};
}
const mapDispatchToProps = (dispatch, props) => {
	return {
		onClick() {
			dispatch(scrollTo(props.item.path));
		},
		onDragEnter(e) {
	        e.preventDefault();
	        e.stopPropagation();
	        //if (!e.currentTarget.classList.contains('file')) return;
	        //console.log('entered ' + e.currentTarget.classList.toString());
	        e.nativeEvent.stopImmediatePropagation();
	        dispatch(dragEnter(props.id, 'file'));
	    },
	    onDragLeave(e) {
	        e.preventDefault();
	        e.stopPropagation();
	        //if (!e.currentTarget.classList.contains('file')) return;
	        //console.log('left ' + e.currentTarget.classList.toString());
	        e.nativeEvent.stopImmediatePropagation();
	        dispatch(dragLeave(props.id, 'file'));
	    },
	    onDrop(e) {
	        e.preventDefault();
	        e.stopPropagation();
	        e.nativeEvent.stopImmediatePropagation();
	        var nFiles = (e.dataTransfer || {}).files || e.target.files;
	        var files = [];
	        for (var i = 0; i < nFiles.length; i++) {
	            files.push(nFiles.item(i));
	        }
	        dispatch(dragDrop(props.id, files));
	    }
	}
}

const FolderItem = connect(mapStateToProps, mapDispatchToProps)(_FolderItem);

export default FolderItem;