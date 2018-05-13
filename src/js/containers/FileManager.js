import {connect} from 'react-redux';
import _FileManager from '../components/FileManager';
import {TestData, createFolderChain, findFile} from '../lib/TestData';

const mapStateToProps = state => {
	//console.log(state);
	return {
		shownFolders: createFolderChain(TestData, state.sidescroll.path),
		scrolling: {
			...state.sidescroll.scrolling,
			folders: (state.sidescroll.scrolling.folders || []).map(x => findFile(TestData, x)),
		},
	}
}

const mapDispatchToProps = dispatch => {
	return {

	}
}

const FileManager = connect(
	mapStateToProps,
	mapDispatchToProps
)(_FileManager);

export default FileManager;