import {connect} from 'react-redux';
import _Breadcrumbs from '../components/Breadcrumbs';

import {TestFolders} from '../lib/TestData';

const defaultFolders = TestFolders;

const mapStateToProps = state => {
	return {
		files: defaultFolders,
	}
}

const mapDispatchToProps = dispatch => {
	return {

	}
}

const Breadcrumbs = connect(
	mapStateToProps,
	mapDispatchToProps
)(_Breadcrumbs);

export default Breadcrumbs;