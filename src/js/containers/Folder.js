import {connect} from 'react-redux';
import {scrollLeft, scrollTo} from '../actions/sidescroll';
import {dragEnter, dragLeave, dragDrop} from '../actions/dragdrop';
import _Folder, {FolderPlaceholder} from '../components/Folder';

const mapStateToProps = state => {
	//console.log(state.filetree.dragging);
	return {
		dragging: state.filetree.dragging,
	};
}

const mapDispatchToProps = (dispatch, props) => {
	return {
		onBackClick(e) {
			e.stopPropagation();
			dispatch(scrollLeft());
		},
		onHeaderClick(e) {
			e.stopPropagation();
			dispatch(scrollTo(props.path));
		},
		onDragEnter(e) {
	        e.preventDefault();
	        e.stopPropagation();
			//if (!e.currentTarget.classList.contains('folder')) return;
	       	//console.log('entered ' + e.currentTarget.classList.toString());
	        e.nativeEvent.stopImmediatePropagation();
	        dispatch(dragEnter(props.id, 'folder'));
	    },
	    onDragLeave(e) {
	        e.preventDefault();
	        e.stopPropagation();
	    	//if (!e.currentTarget.classList.contains('folder')) return;
	        //console.log('left ' + e.currentTarget.classList.toString());
	        e.nativeEvent.stopImmediatePropagation();
	        dispatch(dragLeave(props.id, 'folder'));
	    },
	    onDrop(e) {
	    	e.nativeEvent.preventDefault();
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
};

const Folder = connect(mapStateToProps, mapDispatchToProps)(_Folder);

export default Folder;
export {FolderPlaceholder};